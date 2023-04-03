import fs from "fs";
import os from "os";
import path from "path";
import {
  command,
  history,
  History,
  HISTSIZE,
  program,
} from "../../src/index.js";

// https://stackoverflow.com/a/52560084/938297
function tmpFile(
  name = "tmp_file",
  data = "",
  encoding: BufferEncoding = "utf8"
) {
  return new Promise<string>((resolve, reject) => {
    const tempPath = path.join(os.tmpdir(), "bandersnatch-");
    fs.mkdtemp(tempPath, (err, folder) => {
      if (err) return reject(err);

      const file_name = path.join(folder, name);

      fs.writeFile(file_name, data, encoding, (error_file) => {
        if (error_file) return reject(error_file);

        resolve(file_name);
      });
    });
  });
}

test("history should return new History object", () => {
  const app = program();

  expect(history(app)).toBeInstanceOf(History);
});

test("commands should end up in history file", async () => {
  const historyFile = await tmpFile("history_file");
  const app = program({ historyFile }).add(command("test").action(() => {}));

  await app.run("test");

  expect(fs.readFileSync(historyFile, "utf8")).toBe("test" + os.EOL);
});

test("history file should be truncated", async () => {
  const historyFile = await tmpFile(
    "history_file",
    [...Array(HISTSIZE).keys()].join(os.EOL) + os.EOL
  );
  const app = program({ historyFile }).add(command("test").action(() => {}));

  await app.run("test");

  expect(fs.readFileSync(historyFile, "utf8")).toBe(
    [...Array(HISTSIZE).keys()].slice(1).join(os.EOL) + os.EOL + "test" + os.EOL
  );
});

test("commands should not end up in history file when disabled", async () => {
  const historyFile = await tmpFile("history_file");
  const app = program({ historyFile: null }).add(
    command("test").action(() => {})
  );

  await app.run("test");

  expect(fs.readFileSync(historyFile, "utf8")).toBe("");
});
