import { argument, Argument } from "../../src/index.js";

test("argument should return new Argument object", () => {
  expect(argument("test")).toBeInstanceOf(Argument);
});

test("getName", () => {
  expect(argument("test").getName()).toBe("test");
});

test("getDescription", () => {
  expect(argument("test", { description: "foo" }).getDescription()).toBe("foo");
});

test("getOptions", () => {
  expect(argument("test", { type: "number" }).getOptions().type).toBe("number");
});

test("required argument", () => {
  expect(argument("test").toCommand()).toBe("<test>");
});

test("optional argument", () => {
  expect(argument("test", { optional: true }).toCommand()).toBe("[test]");
});

test("variadic argument", () => {
  expect(argument("test", { variadic: true }).toCommand()).toBe("[test..]");
});

test("promptable argument", () => {
  const arg1 = argument("test", { description: "foo", prompt: true });
  expect(arg1.getPrompt()).toBe("foo");

  const arg2 = argument("test", { prompt: true });
  expect(arg2.getPrompt()).toBe("test");

  const arg3 = argument("test", { prompt: "bar" });
  expect(arg3.getPrompt()).toBe("bar");
});
