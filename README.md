# bandersnatch

[![npm](https://img.shields.io/npm/v/bandersnatch)](https://www.npmjs.com/package/bandersnatch)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/hongaar/bandersnatch/ci)](https://github.com/hongaar/bandersnatch/actions?query=workflow%3Aci)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/bandersnatch)](https://bundlephobia.com/result?p=bandersnatch)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/issues)
[![Code Climate coverage](https://img.shields.io/codeclimate/coverage/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/code)

> Super lightweight and friendly CLI framework for Node.js.

**🚧 alpha version**

## Features

- 🌊 [Fluid](https://www.martinfowler.com/bliki/FluentInterface.html) syntax
- ➰ Built-in [REPL](https://en.wikipedia.org/wiki/Read–eval–print_loop)
- 💬 Prompts for missing arguments
- ➡ Autocompletes arguments, options and values
- 🤯 Fully typed
- ⚡ Uses the power of `yargs` and `inquirer`

It's built-in TypeScript to provide you with some very handy type hints.

Bandersnatch is not designed to be used as a full CLI framework like oclif,
and tries to minimize the assumptions made about your program to make
bandersnatch easy and intuitive to work with.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Simple](#simple)
  - [REPL](#repl)
  - [Prompt](#prompt)
- [Principles](#principles)
  - [Output](#output)
- [API](#api)
  - [`program(description)`](#programdescription)
    - [`program.add(command)`](#programaddcommand)
    - [`program.default(command)`](#programdefaultcommand)
    - [`program.prompt(prompt)`](#programpromptprompt)
    - [`program.withHelp()`](#programwithhelp)
    - [`program.withVersion()`](#programwithversion)
    - [`program.run(command)`](#programruncommand)
    - [`program.repl()`](#programrepl)
    - [`program.runOrRepl()`](#programrunorrepl)
  - [`command(name, description)`](#commandname-description)
    - [`command.argument(name, description, options)`](#commandargumentname-description-options)
    - [`command.option(name, description, options)`](#commandoptionname-description-options)
    - [`command.command(command)`](#commandcommandcommand)
    - [`command.default()`](#commanddefault)
    - [`command.action(function)`](#commandactionfunction)
- [Bundle](#bundle)
- [Todo](#todo)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

### Installation

```bash
# Add dependency
yarn add bandersnatch
```

### Simple

Now create a simple app `concat.ts`:

```ts
import { program, command } from 'bandersnatch'

const concat = command('concat', 'Concatenate input')
  .argument('input', 'List of inputs to concatenate', { variadic: true })
  .action((args) => console.log(args.input.join(', '))

program().default(concat).run()
```

And run with:

```bash
$ ts-node concat.ts Hello world
Hello, world
```

_👆 Assuming you have `ts-node` installed._

### REPL

Let's dive right into some more features. This simple app has a single default
command which pretty prints JSON input. When invoked without input, it'll show
an interactive prompt:

```ts
import { program, command } from 'bandersnatch'

const app = program('JSON pretty printer').default(
  command()
    .argument('json', 'Raw JSON input as string')
    .option('color', 'Enables colorized output', { type: 'boolean' })
    .action(async (args) => {
      const json = JSON.parse(args.json)
      args.color
        ? console.dir(json)
        : console.log(JSON.stringify(json, undefined, 4))
    })
)

app.runOrRepl()
```

And run with:

```bash
$ ts-node pretty.ts
> [0,1,1,2,3,5]
[
    0,
    1,
    1,
    2,
    3,
    5
]
```

Now, try typing `[0,1,1,2,3,5] --c` and then hit `TAB`. 😊

### Prompt

Bandersnatch can also ask a user for input if arguments were not provided on the
command line:

```ts
import { program, command } from 'bandersnatch'

const cmd = command()
  .argument('name', "What's your name?", {
    prompt: true,
  })
  .argument('question', "What's your question?", {
    prompt: true,
  })
  .action((args) => {
    console.log(`Hi ${args.name}, the answer to "${args.question}" is 42.`)
  })

program('Ask me anything').default(cmd).run()
```

And run with:

```bash
$ ts-node ama.ts --name Joram
? What's your question? What is the meaning of life?
Hi Joram, the answer to "What is the meaning of life?" is 42.
```

When you omit the `--name` part, the program will also prompt for it.

---

ℹ More examples in the [examples](https://github.com/hongaar/bandersnatch/tree/alpha/examples) directory.

## Principles

In general, bandersnatch is designed to create [twelve-factor apps](https://12factor.net/).

### Output

Programs are encouraged to use the following conventions with regards to output,
based on the [POSIX standard](https://pubs.opengroup.org/onlinepubs/9699919799/functions/stdin.html).

- When a program is designed to be used in a scripting environment and its
  output should be available as stdin for other programs, use stdout for
  printing output and stderr for diagnostic output (e.g. progress and/or error
  messages).
- When a program is designed to be used as a service (twelve-factor app), use
  stdout/stderr as a logging mechanism for informative messages/error and
  diagnostic messages.

Bandersnatch has no built-in method for writing to stdout/stderr. Node.js
provides [everything you need](https://nodejs.org/api/console.html).

## API

All methods are chainable unless the docs mention otherwise.

### `program(description)`

Creates a new program.

- Description (string, optional) is used in --help output.

#### `program.add(command)`

Adds a command to the program.

```ts
program().add(command(...))
```

#### `program.default(command)`

Adds a default command to the program. Shorthand for:

```ts
program().add(command(...).default())
```

#### `program.prompt(prompt)`

Use this prompt prefix (string, required) when in REPL mode.

#### `program.withHelp()`

Adds `help` and `--help` to the program which displays program usage information.

#### `program.withVersion()`

Adds `version` and `--version` to the program which displays program version from
package.json.

#### `program.run(command)`

Uses process.argv or passed in command (string, optional) to match and execute
command. Returns promise.

```ts
program()
  .add(command(...))
  .run()
```

#### `program.repl()`

Start a read-eval-print loop.

```ts
program()
  .add(command(...))
  .repl()
```

#### `program.runOrRepl()`

Invokes `run()` if arguments are passed in, `repl()` otherwise.

```ts
program()
  .add(command(...))
  .runOrRepl()
```

### `command(name, description)`

Creates a new command.

- Name (string, optional) is used to invoke a command. When not used as the
  default command, a name is required.
- Description (string, optional) is used in --help output.

#### `command.argument(name, description, options)`

Adds a positional argument to the command.

- Name (string, required) is used to identify the argument. Can also be an array
  of strings, in which case subsequent items will be treated as command aliases.
- Description (string, optional) is used in --help output.
- Options can be provided to change the behavior of the
  argument. Object with any of these keys:
  - `optional` (boolean) makes this argument optional.
  - `variadic` (boolean) eagerly take all remaining arguments and parse as an array.
    Only valid for the last argument.
  - ...

#### `command.option(name, description, options)`

Adds an option to the command.

- Name (string, required) is used to identify the option.
- Description (string, optional) is used in --help output.
- Options (OptionOptions) can be provided to change the behavior of the
  option. Object with any of these keys:
  - `alias` (string or array of strings) alias(es) for the option key.
  - ...

#### `command.command(command)`

Adds a sub-command to the command.

#### `command.default()`

Mark command as default. Default commands are executed immediately and don't require a name.

#### `command.action(function)`

Function to execute when the command is invoked. Is called with one argument: an
object containing key/value pairs of parsed arguments and options.

## Bundle

There are many options to bundle your application for distribution. We'll
discuss a common pattern.

ℹ An example can be found in the [examples/bundle](https://github.com/hongaar/bandersnatch/tree/alpha/examples/bundle) directory.

Init a `package.json` if needed:

```bash
mkdir echo && cd echo
yarn init
```

Install dependencies:

```bash
yarn add bandersnatch
yarn add typescript pkg --dev
```

And create an example app in `src/cli.ts`:

```ts
import { program, command } from 'bandersnatch'

export default program()
  .withHelp()
  .default(
    command('echo', 'Echo something in the terminal')
      .argument('words', 'Say some kind words', { variadic: true })
      .action(console.log)
  )
```

Building your app with TypeScript is very powerful, but runtime compilation is
slow so we compile the code ahead of time.

Add a `tsconfig.json`, similar to:

```json
{
  "include": ["./src"],
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "lib": ["es2017"],
    "declaration": true,
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

Add these scripts to your `package.json`:

```diff
 {
   "name": "echo",
   "version": "1.0.0",
   "main": "index.js",
   "license": "MIT",
+  "scripts": {
+    "prepublishOnly": "yarn build",
+    "build": "tsc",
+  },
   "dependencies": {
     "bandersnatch": "^1.0.0-alpha.2"
   },
   "devDependencies": {
     "pkg": "^4.4.2",
     "typescript": "^3.7.3"
   }
 }
```

And compile now by running `yarn build`.

Next, we need to create a simple entry point `echo.js`, which can be run with
node:

```bash
#!/usr/bin/env node

require('./lib/cli').default.run()
```

To run your app, users may want to run `yarn global add echo`. For this to
work, we need to make a small adjustment to `package.json`:

```diff
 {
   "name": "echo",
   "version": "1.0.0",
-  "main": "index.js",
+  "bin": "echo.js",
+  "files": [
+    "lib"
+  ],
   "license": "MIT",
   "scripts": {
     "prepublishOnly": "yarn build",
     "build": "tsc",
   },
   "dependencies": {
     "bandersnatch": "^1.0.0-alpha.2"
   },
   "devDependencies": {
     "pkg": "^4.4.2",
     "typescript": "^3.7.3"
   }
 }
```

You can now `npm publish`.

To create a binary (your app with Node.js bundled), add this script to
`package.json`:

```diff
 {
   "name": "echo",
   "version": "1.0.0",
   "bin": "echo.js",
   "files": [
     "lib"
   ],
   "license": "MIT",
   "scripts": {
     "prepublishOnly": "yarn build",
     "build": "tsc",
+    "bundle": "yarn build && pkg -t host ."
   },
   "dependencies": {
     "bandersnatch": "^1.0.0-alpha.2"
   },
   "devDependencies": {
     "pkg": "^4.4.2",
     "typescript": "^3.7.3"
   }
 }
```

_👆 Omit `-t host` to create binaries for all platforms._

Run `yarn bundle` and then `./echo --help`. 💪

Optionally deploy to GitHub, S3, etc. using your preferred CD method if needed.

## Todo

- [ ] Better code coverage
- [ ] Choices autocompletion in REPL mode

## Contributing

Contributions are very welcome. Please note this project is in a very early
stage and the roadmap is a bit foggy still...

```bash
# Clone and install
git clone git@github.com:hongaar/bandersnatch.git
cd bandersnatch
yarn

# Run an example
yarn start examples/simple.ts
```

Please use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

## License

Copyright (c) 2020 Joram van den Boezem. Licensed under the MIT license.

---

Inspired by [vorpal](https://vorpal.js.org/)
