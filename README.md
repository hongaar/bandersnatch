# bandersnatch

[![npm](https://img.shields.io/npm/v/bandersnatch)](https://www.npmjs.com/package/bandersnatch)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/hongaar/bandersnatch/ci)](https://github.com/hongaar/bandersnatch/actions?query=workflow%3Aci)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/bandersnatch)](https://bundlephobia.com/result?p=bandersnatch)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/issues)
[![Code Climate coverage](https://img.shields.io/codeclimate/coverage/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/code)

> Super lightweight and friendly CLI scaffolding for Node.js programs.

**🚧 alpha version**

## Features

- 🌊 [Fluid](https://www.martinfowler.com/bliki/FluentInterface.html) syntax
- ➰ Built-in [REPL](https://en.wikipedia.org/wiki/Read–eval–print_loop)
- 💬 Prompts for missing arguments
- 🔜 Autocompletes arguments
- 🤯 Fully typed
- ⚡ Uses the power of `yargs` and `inquirer`

It's built in TypeScript and command arguments are fully typed.

Bandersnatch is not designed to be used as a full CLI framework like oclif, and
tries to minimize the assumptions made about your program to make it easy and
intuitive to work with.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Simple example](#simple-example)
  - [REPL example](#repl-example)
  - [Prompt](#prompt)
- [API](#api)
  - [`program(options)`](#programoptions)
    - [`program.description(description)`](#programdescriptiondescription)
    - [`program.prompt(prompt)`](#programpromptprompt)
    - [`program.add(command)`](#programaddcommand)
    - [`program.default(command)`](#programdefaultcommand)
    - [`program.run(command)`](#programruncommand)
    - [`program.repl()`](#programrepl)
    - [`program.runOrRepl()`](#programrunorrepl)
    - [`program.isRepl()`](#programisrepl)
    - [`program.on(event, listener)`](#programonevent-listener)
  - [`command(name, options)`](#commandname-options)
    - [`command.argument(name, options)`](#commandargumentname-options)
    - [`command.option(name, options)`](#commandoptionname-options)
    - [`command.command(command)`](#commandcommandcommand)
    - [`command.default()`](#commanddefault)
    - [`command.action(function)`](#commandactionfunction)
- [Design principles](#design-principles)
  - [Errors](#errors)
  - [Output](#output)
- [Bundle](#bundle)
- [Todo](#todo)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

### Installation

```bash
# Add dependency
yarn|npm add bandersnatch
```

### Simple example

Let's create a simple program `foo.ts`:

```ts
import { program, command } from 'bandersnatch'

const foo = command('foo')
  .description('Outputs "bar".')
  .action(() => console.log('bar'))

program().default(foo).run()
```

This creates a new program, adds a default command which logs "bar" to the
stdout, and runs the program.

Now try your program by running it:

```
$ ts-node foo.ts
bar
```

_ℹ Assuming you have `ts-node` installed._

Try running `ts-node foo.ts help` to see the auto-generated help output:

```
$ ts-node foo.ts help
bin.js

Outputs "bar".

Commands:
  bin.js     Outputs "bar".                                            [default]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

_ℹ You see `bin.js` here instead of `foo.ts` because we're running the program
with `ts-node`._

### REPL example

A program can also show an interactive
[REPL](https://en.wikipedia.org/wiki/Read–eval–print_loop) to make interacting
with more complex programs easier and to enable autocompleting of commands and
arguments.

Let's create a new program `dice.ts` with a command to roll a dice:

```ts
import { program, command } from 'bandersnatch'

async function rng(bounds: [number, number]) {
  const [min, max] = bounds
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const dice = program().add(
  command('roll')
    .option('min', { default: 1 })
    .option('max', { default: 6 })
    .action(async (args) => {
      console.log(await rng([args.min, args.max]))
    })
)

dice.repl()
```

This code defines a program `dice` and a command `roll` with two options, both
of which will inherit a default value. When the command is executed, it calls
an async random number generator (async only for illustrative purposes) and
writes its results to stdout.

The last line in our code runs the program as a interactive REPL, which means
it won't accept any arguments on the command line, but render a prompt instead.
This prompt will read any user input, parse it, and execute matching commands.

Try rolling the dice:

```
$ ts-node dice.ts
> roll
5
```

The REPL can autocomplete commands, arguments and options. Try typing only the
letter `r` and then hit _TAB_. This works for options as well:

```
$ ts-node dice.ts
> r
[TAB]
> roll -
[TAB]
> roll --m
[TAB] [TAB]
--min   --max
```

### Prompt

Bandersnatch can also ask a user for input if arguments were not provided on the
command line:

Let's say we want to write a program `pizza.ts` which takes pizza orders:

```ts
import { program, command } from 'bandersnatch'

const cmd = command()
  .argument('address', {
    prompt: 'Your address',
  })
  .argument('name', {
    description: 'Your name',
    default: 'anonymous',
    prompt: true,
  })
  .option('size', {
    description: 'Choose pizza size',
    choices: ['small', 'medium', 'large'],
    default: 'medium',
    prompt: true,
  })
  .option('toppings', {
    description: 'Pick some toppings',
    choices: ['mozarella', 'pepperoni', 'veggies'],
    default: ['mozarella'],
    prompt: true,
  })
  .option('confirmed', {
    description: 'Order pizza?',
    default: true,
    prompt: true,
  })
  .action((args) => {
    console.log(args)
  })

program().description('Order a pizza').default(cmd).run()
```

And run it:

```
$ ts-node pizza.ts
? Your address The Netherlands
? Your name Joram
? Choose pizza size small
? Pick some toppings veggies
? Order pizza? Yes
{
  name: 'Joram',
  size: 'small',
  toppings: [ 'veggies' ],
  confirmed: true,
  address: 'The Netherlands'
}
```

You can choose to specify parameters on the command line, in which case you
won't get a prompt for these options:

```
$ ts-node pizza.ts "The Netherlands" --name Joram --confirmed
? Choose pizza size small
? Pick some toppings veggies
? Order pizza? Yes
{
  name: 'Joram',
  size: 'small',
  toppings: [ 'veggies' ],
  confirmed: true,
  address: 'The Netherlands'
}
```

⚠ Please note that even though `--confirmed` was specified on the command line,
it was still being prompted. This is a known issue. In this case, the default
value was the same as the input, in which case bandersnatch doesn't know whether
a value was explicitly passed in or inherited from the default value.

---

ℹ More examples in the
[examples](https://github.com/hongaar/bandersnatch/tree/alpha/examples)
directory.

## API

All methods are chainable unless the docs mention otherwise.

### `program(options)`

Creates a new program. Options (object, optional) can contain these keys:

- `description` (string, optional) is used in --help output.
- `prompt` (string, default: `>`) use this prompt prefix when in REPL mode.
- `help` (boolean, default: true) adds `help` and `--help` to the program which
  displays program usage information.
- `version` (boolean, default: true) adds `version` and `--version` to the
  program which displays program version from package.json.

#### `program.description(description)`

Sets the program description (string, required) used in --help output.

#### `program.prompt(prompt)`

Use this prompt prefix (string, required) when in REPL mode.

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

#### `program.run(command)`

Uses process.argv or passed in command (string, optional) to match and execute
command. Returns promise.

```ts
program()
  .add(command(...))
  .run()
```

#### `program.repl()`

Start a read-eval-print loop. Returns promise-like repl instance.

```ts
program()
  .add(command(...))
  .repl()
```

#### `program.runOrRepl()`

Invokes `run()` if process.argv is set, `repl()` otherwise. Returns promise or
promise-like repl instance.

```ts
program()
  .add(command(...))
  .runOrRepl()
```

#### `program.isRepl()`

Returns `true` if program is running a repl loop, `false` otherwise.

#### `program.on(event, listener)`

Attaches a listener function for the event. Currently, these events are
supported:

```ts
// Fired before a command action is invoked
program().on('run', (cmd) => logger.debug(`Running ${cmd}`))
```

### `command(name, options)`

Creates a new command.

- Name (string, optional) is used to invoke a command. When not used as the
  default command, a name is required.
- Options (object, optional) can contain these keys:
  - `description` (string, optional) is used in --help output.

#### `command.argument(name, options)`

Adds a positional argument to the command.

- Name (string, required) is used to identify the argument.
- Options can be provided to change the behavior of the argument. Object with
  any of these keys:
  - `description` (string) is used in --help output.
  - `optional` (boolean) makes this argument optional.
  - `variadic` (boolean) eagerly take all remaining arguments and parse as an
    array. Only valid for the last argument.
  - `type` (string) one of `"boolean"|"number"|"string"` which determines the
    runtime type of the argument.
  - `default` (any) default value for the argument.
  - `choices` (array) any input value should be included in the array, or it
    will be rejected.
  - `prompt` (boolean|string) prompts for missing arguments. If it is true, it
    will use the arguments description or name as the question text. If it is a
    string, it will be used as the question text.
  - `alias` (string|array) alias or aliases for the argument.
  - `coerce` (function) transform function for this argument value (untyped).

#### `command.option(name, options)`

Adds an option to the command.

- Name (string, required) is used to identify the option.
- Options (object, optional) can be provided to change the behavior of the
  option. Object with any of these keys:
  - `description` (string, optional) is used in --help output.
  - `type` (string) one of `"array"|"boolean"|"count"|"number"|"string"` which
    determines the runtime type of the argument. Use count for the number of
    times an option was provided (e.g. verbosity levels).
  - `default` (any) default value for the argument.
  - `choices` (array) any input value should be included in the array, or it
    will be rejected.
  - `prompt` (boolean|string) prompts for missing arguments. If it is true, it
    will use the arguments description or name as the question text. If it is a
    string, it will be used as the question text.
  - `alias` (string|array) alias or aliases for the option.
  - `coerce` (function) transform function for this option value (untyped).

#### `command.command(command)`

Adds a sub-command to the command.

#### `command.default()`

Mark command as default. Default commands are executed immediately and don't
require a name.

#### `command.action(function)`

Function which executes when the command is invoked. Is called with these
arguments:

1. Args (object) is an object containing key/value pairs of parsed arguments and
   options.
2. Command runner (function) can be invoked with one (string) parameter to
   execute another command.

## Design principles

In general, bandersnatch is designed to create
[twelve-factor apps](https://12factor.net/).

### Errors

The bandersnatch API allows to catch errors in a promise-like way. The `run` and
`repl` program methods return either a promise or promise-like object which can
be used to handle program errors:

```ts
program()
  .default(
    command()
      .description('This command will always fail')
      .action(function () {
        throw new Error('Whoops')
      })
  )
  .runOrRepl()
  .catch((error: any) => {
    console.error('[failed]', String(error))

    if (!app.isRepl()) {
      process.exit(1)
    }
  })
```

### Output

Programs are encouraged to use the following conventions with regards to output,
based on the
[POSIX standard](https://pubs.opengroup.org/onlinepubs/9699919799/functions/stdin.html).

- When a program is designed to be used in a scripting environment and its
  output should be available as stdin for other programs, use stdout for
  printing output and stderr for diagnostic output (e.g. progress and/or error
  messages).
- When a program is designed to be used as a service (twelve-factor app), use
  stdout/stderr as a logging mechanism for informative messages/error and
  diagnostic messages.

Bandersnatch has no built-in method for writing to stdout/stderr. Node.js
provides [everything you need](https://nodejs.org/api/console.html).

## Bundle

There are many options to bundle your application for distribution. We'll
discuss a common pattern.

ℹ An example can be found in the
[examples/bundle](https://github.com/hongaar/bandersnatch/tree/alpha/examples/bundle)
directory.

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
- [ ] Choices autocompletion in REPL mode (open upstream PR in yargs)

## Contributing

Contributions are very welcome. Please note this project is in a very early
stage and the roadmap is a bit foggy still...

```bash
# Clone and install
git clone git@github.com:hongaar/bandersnatch.git
cd bandersnatch
yarn

# Run an example
yarn start examples/foo.ts
```

Please use
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

## License

Copyright (c) 2020 Joram van den Boezem. Licensed under the MIT license.

---

Inspired by [vorpal](https://vorpal.js.org/)
