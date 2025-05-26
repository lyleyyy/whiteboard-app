export interface Command {
  do(): void;
  undo(): void;
}
