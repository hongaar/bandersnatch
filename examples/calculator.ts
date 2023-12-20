import { argument, command, program } from "../src/index.js";

type Args = { number: number[] };

const number = argument("number", { type: "number", variadic: true });

const makeOutput =
  (op: string, initial = (args: Args) => 0) =>
  (args: Args) =>
    args.number.reduce(
      (sum, arg) => eval(`${sum} ${op} ${arg}`),
      initial(args),
    );

program()
  .description("calculator")
  .add(
    command<Args>(["add"])
      .description("Add one or more numbers to 0")
      .add(number)
      .action(makeOutput("+")),
  )
  .add(
    command<Args>(["sub", "subtract"])
      .description("Subtract one or more numbers from 0")
      .add(number)
      .action(makeOutput("-")),
  )
  .add(
    command<Args>(["mul", "multiply"])
      .description("Multiply one or more numbers from 1")
      .add(number)
      .action(makeOutput("*", () => 1)),
  )
  .add(
    command<Args>(["div", "divide"])
      .description("Divide two or more numbers in order")
      .add(number)
      .action(makeOutput("/", (args) => args.number[0] * args.number[0])),
  )
  .add(
    command<Args>(["pow", "power"])
      .description("Raise numbers to a power in order")
      .add(number)
      .action(makeOutput("**", () => 1)),
  )
  .runOrRepl()
  .then(console.log)
  .catch(console.error);
