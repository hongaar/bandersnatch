import { command, program } from "../src/index.js";

function printArgs<T>(args: T) {
  console.log("Args are", args);
}

/**
 * Keep in mind that argument/option types are not validated at runtime.
 * For example, when providing a default value with type boolean, it can be set
 * to a string value at runtime.
 */

const string = command("string")
  .argument("arg1", { description: "Required string argument" })
  .argument("arg2", { optional: true, description: "Optional string argument" })
  .argument("arg3", { variadic: true, description: "Variadic string argument" })
  .option("opt1", { type: "string", description: "String option" })
  .option("opt2", {
    default: "foo",
    description: "String option with default",
  })
  .action(printArgs);

const number = command("number")
  .argument("arg1", { type: "number", description: "Required number argument" })
  .argument("arg2", {
    type: "number",
    optional: true,
    description: "Optional number argument",
  })
  .argument("arg3", {
    type: "number",
    variadic: true,
    description: "Variadic number argument",
  })
  .option("opt1", { type: "number", description: "Number option" })
  .option("opt2", { default: 100, description: "Number option with default" })
  .action(printArgs);

const boolean = command("boolean")
  .argument("arg1", {
    type: "boolean",
    description: "Required boolean argument",
  })
  .argument("arg2", {
    type: "boolean",
    optional: true,
    description: "Optional boolean argument",
  })
  .argument("arg3", {
    type: "boolean",
    variadic: true,
    description: "Variadic boolean argument",
  })
  .option("opt1", { type: "boolean", description: "Boolean option" })
  .option("opt2", {
    default: false,
    description: "Boolean option with default",
  })
  .action(printArgs);

const choices = command("choices")
  .argument("arg", {
    description: "Argument with choices",
    choices: ["foo", "bar"] as const,
  })
  .option("opt", {
    description: "Option with choices",
    choices: ["option1", "option2"] as const,
    default: "option3",
  })
  .action(printArgs);

const defaultValues = command("default")
  .argument("arg", {
    description: "Optional argument with default value",
    default: 5,
    optional: true,
  })
  .option("opt", { description: "Default value", default: true })
  .action(printArgs);

const constraints = command("constraint")
  .argument("arg", {
    description: "Required argument",
  })
  .argument("optionalArg", {
    description: "Required argument",
    optional: true,
  })
  .option("opt", { description: "Required option", required: true })
  .option("opt1a", {
    description: "Also requires option 1a",
    requires: "opt1b",
  })
  .option("opt1b", {
    description: "Also requires option 1b",
    requires: "opt1a",
  })
  .option("opt2", { description: "Forbids option 1a", excludes: "opt1a" })
  .option("opt3", {
    description: "Also requires optionalArg",
    requires: "optionalArg",
  })

  .action(printArgs);

const app = program()
  .description("All argument and option types")
  .add(string)
  .add(number)
  .add(boolean)
  .add(choices)
  .add(defaultValues)
  .add(constraints);

app.runOrRepl();
