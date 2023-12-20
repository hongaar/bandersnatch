import mockArgv from "mock-argv";
import { command, program, Program, Repl } from "../../src/index.js";

jest.mock("../../src/repl", () => {
  return {
    repl: jest.fn().mockImplementation(() => {
      return new MockedRepl();
    }),
    Repl: jest.fn().mockImplementation(() => {
      return MockedRepl;
    }),
  };
});

// Repl mock
const replStartFn = jest.fn();
class MockedRepl {
  start = replStartFn;
  attachHistory = jest.fn();
}

beforeEach(() => {
  const MockedRepl = jest.mocked(Repl);
  MockedRepl.mockClear();
});

test("program should return new Program object", () => {
  expect(program()).toBeInstanceOf(Program);
});

test("program executes command", async () => {
  const app = program().add(
    command("test").action(() => {
      return "foo";
    }),
  );
  await expect(app.run("test")).resolves.toBe("foo");
});

test("program executes argv", async () => {
  await mockArgv(["test"], async () => {
    const app = program().add(
      command("test").action(() => {
        return "foo";
      }),
    );
    await expect(app.run()).resolves.toBe("foo");
  });
});

test("program passes parserConfiguration", async () => {
  await mockArgv(["test", "--test-field", "1"], async () => {
    const app = program({ parserConfiguration: { "strip-dashed": true } }).add(
      command("test")
        .option("test-field")
        .action((args) => {
          return JSON.stringify(args);
        }),
    );
    await expect(app.run()).resolves.toBe('{"testField":1}');
  });
});

test("program starts repl", async () => {
  const app = program();
  expect(app.repl()).toBeInstanceOf(MockedRepl);
  expect(replStartFn).toHaveBeenCalled();
});
