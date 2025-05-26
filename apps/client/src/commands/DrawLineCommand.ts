import type { Dispatch, SetStateAction } from "react";
import type { LineInterface } from "../types/LineInterface";
import type { Command } from "./types";

export class DrawLineCommand implements Command {
  private line: LineInterface;
  private setLines: Dispatch<SetStateAction<LineInterface[]>>;

  constructor(
    line: LineInterface,
    setLines: Dispatch<SetStateAction<LineInterface[]>>
  ) {
    this.line = line;
    this.setLines = setLines;
  }

  do() {
    this.setLines((prev) => [...prev, this.line]);
  }

  undo() {
    this.setLines((prev) => prev.filter((line) => line.id !== this.line.id));
  }
}
