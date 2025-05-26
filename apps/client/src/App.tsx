import { useEffect, useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { Stage, Layer, Line } from "react-konva";
import type { Command } from "./commands/types";
import type { LineInterface } from "./types/LineInterface.js";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const [undoStack, setUndoStack] = useState<Command[]>([]);
  const [redoStack, setRedoStack] = useState<Command[]>([]);

  useEffect(() => {
    function undo(e: KeyboardEvent) {
      if (e.key === "z" && e.metaKey) {
        console.log("undo");
      }
    }

    function redo(e: KeyboardEvent) {
      if (e.key === "z" && e.metaKey && e.shiftKey) {
        console.log("redo");
      }
    }

    window.addEventListener("keydown", undo);
    window.addEventListener("keydown", redo);

    return () => {
      window.removeEventListener("keydown", undo);
      window.removeEventListener("keydown", redo);
    };
  }, []);

  function handleMouseDown() {
    setIsDrawing(true);
  }

  function handleMouseUp() {
    setIsDrawing(false);
    if (!line) setLines((prev) => [...prev, line]);
    setLine(null);
  }

  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    const newCoord = e.target.getStage()?.getPointerPosition();
    if (!newCoord) return;

    const newLine = {
      id: line?.id || uuidv4(),
      points: [...line?.points, newCoord.x, newCoord.y],
      stroke: "blacks",
      strokeWidth: 1,
    };
    if (isDrawing) setLine(newLine);
  }

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={(e) => handleMouseMove(e)}
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
  );
}

export default App;
