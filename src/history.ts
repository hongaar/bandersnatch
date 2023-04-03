import fs from "fs";
import os from "os";
import { REPLServer } from "repl";
import { Program } from "./program.js";

export const HISTSIZE = 500;

/**
 * Create new history instance.
 */
export function history(program: Program) {
  return new History(program);
}

export class History {
  private path: string;

  constructor(private program: Program) {
    this.path = this.program.options.historyFile!;

    this.program.on("run", (command) => this.push(command));
  }

  /**
   * Add a new entry to the history file.
   */
  public push(entry: string | readonly string[]) {
    if (Array.isArray(entry)) {
      entry = entry.join(" ");
    }

    // Truncate if needed and if possible
    try {
      const historyContents = fs.readFileSync(this.path, "utf8").split(os.EOL);
      if (historyContents.length > HISTSIZE) {
        fs.writeFileSync(
          this.path,
          historyContents.slice(historyContents.length - HISTSIZE).join(os.EOL),
          "utf8"
        );
      }
    } catch (err) {}

    fs.appendFileSync(this.path, entry + os.EOL);
  }

  /**
   * Read the history file and hydrate the REPL server history.
   */
  public hydrateReplServer(server: REPLServer) {
    // @ts-ignore
    if (typeof server.history !== "object") {
      return;
    }

    try {
      fs.readFileSync(this.path, "utf-8")
        .split(os.EOL)
        .reverse()
        .filter((line) => line.trim())
        // @ts-ignore
        .map((line) => server.history.push(line));
    } catch (err) {
      // Ignore history file read errors
    }
  }
}
