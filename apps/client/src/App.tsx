import { useEffect, useState } from "react";
import { DrawLineCommand } from "./commands/DrawLineCommand.ts";
import type { Command } from "./commands/types";
import type { LineInterface } from "./types/LineInterface.ts";
import type { KonvaEventObject } from "konva/lib/Node";
import { Stage, Layer, Line } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import ThemeButton from "./components/ThemeButton.tsx";
import { useSearchParams } from "react-router";
import { socket } from "./lib/socketClient.ts";

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const [undoStack, setUndoStack] = useState<Command[]>([]);
  const [redoStack, setRedoStack] = useState<Command[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("room");

  useEffect(() => {
    if (searchParams) {
      console.log(`I am in room ${roomId}`);
      socket.emit("joinroom", roomId);
    }
  }, [searchParams, roomId]);

  // undo redo
  useEffect(() => {
    function undoRedo(e: KeyboardEvent) {
      if (e.key === "z" && e.metaKey) {
        // redo
        if (e.shiftKey) {
          if (redoStack.length !== 0) {
            const redoCommand = redoStack.pop();
            if (redoCommand) {
              redoCommand.do();
              setUndoStack((prev) => [...prev, redoCommand]);
              setRedoStack(redoStack);
              socket.emit("command", {
                type: "redo",
                shape: "line",
                command: redoCommand,
              });
            }
          }
        } else {
          // undo
          if (undoStack.length !== 0) {
            const undoCommand = undoStack.pop();
            if (undoCommand) {
              undoCommand.undo();
              setRedoStack((prev) => [...prev, undoCommand]);
              setUndoStack(undoStack);
              socket.emit("command", {
                type: "undo",
                shape: "line",
                command: undoCommand,
              });
            }
          }
        }
      }
    }

    window.addEventListener("keydown", undoRedo);

    return () => {
      window.removeEventListener("keydown", undoRedo);
    };
  }, [undoStack, redoStack, lines]);

  // socket listener
  useEffect(() => {
    socket.on("command", (data) => {
      if (data.type === "draw") {
        if (data.shape === "line") {
          const { line } = data;
          setLines((prev) => [
            ...prev.filter((drawedLine) => drawedLine.id !== line.id),
            line,
          ]);
        }
      }

      if (data.type === "undo") {
        if (data.command.shape === "line") {
          const { targetShapeId } = data.command;
          setLines((prev) => prev.filter((line) => line.id !== targetShapeId));
        }
      }

      if (data.type === "redo") {
        if (data.command.shape === "line") {
          const { line } = data.command;
          setLines((prev) => [...prev, line]);
        }
      }
    });

    return () => {
      socket.off("command");
    };
  }, []);

  function handleMouseDown() {
    setIsDrawing(true);
  }

  function handleMouseUp() {
    setIsDrawing(false);
    if (line !== null) setLines((prev) => [...prev, line]);
    setLine(null);
    if (line !== null) {
      const drawLineCommand = new DrawLineCommand(line, setLines);
      setUndoStack((prev) => [...prev, drawLineCommand]);
      setRedoStack([]);
    }
  }

  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    const newCoord = e.target.getStage()?.getPointerPosition();
    if (!newCoord) return;

    const newLine = {
      id: line?.id || uuidv4(),
      points: [...(line?.points ?? []), newCoord.x, newCoord.y],
      stroke: "blacks",
      strokeWidth: 2,
    };

    if (isDrawing) {
      setLine(newLine);

      // socket io emits event
      // socket.emit("drawline", newLine);
      socket.emit("command", { type: "draw", shape: "line", line: newLine });
      // throttledEmit(newLine);
    }
  }

  function handleNewRoom(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const params = new URLSearchParams();
    const newRoomId = uuidv4();
    params.set("room", newRoomId);
    setSearchParams(params);
  }

  return (
    <>
      <ThemeButton
        positionCss="absolute right-5 top-5"
        buttonName="New Room"
        onClick={(e) => handleNewRoom(e)}
      />
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {isDrawing && <Line points={line?.points} stroke="black" />}
          {lines.map((line) => (
            <Line
              key={line.id}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
}

export default App;
