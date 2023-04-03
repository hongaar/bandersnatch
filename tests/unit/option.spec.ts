import { option, Option } from "../../src/index.js";

test("option should return new Option object", () => {
  expect(option("test")).toBeInstanceOf(Option);
});
