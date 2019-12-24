# bandersnatch

[![npm](https://img.shields.io/npm/v/bandersnatch)](https://www.npmjs.com/package/bandersnatch)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/hongaar/bandersnatch/ci)](https://github.com/hongaar/bandersnatch/actions?query=workflow%3Aci)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/bandersnatch)](https://bundlephobia.com/result?p=bandersnatch)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/issues)
[![Code Climate coverage](https://img.shields.io/codeclimate/coverage/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/code)

> Super lightweight and friendly CLI framework for Node.js.

**🚧 alpha version**

## Features

- ➰ Built-in REPL
- 💬 Prompts for missing arguments
- ➡ Autocompletes arguments, options and values
- 🤯 Fully typed
- ⚡ Uses the power of `yargs` & `inquirer`

It's built in TypeScript and while it's of course possible to write your app
with JavaScript, you're missing out on some very handy type hints.

We don't have a generator, auto-updater and we don't make any decisions for you
(apart from using inquirer for prompts). This makes bandersnatch pretty easy and
intuitive to work with.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Getting started](#getting-started)
- [API](#api)
  - [`program(description)`](#programdescription)
    - [`program.add(command)`](#programaddcommand)
    - [`program.default(command)`](#programdefaultcommand)
    - [`program.prompt(prompt)`](#programpromptprompt)
    - [`program.withHelp()`](#programwithhelp)
    - [`program.withVersion()`](#programwithversion)
    - [`program.fail(function)`](#programfailfunction)
    - [`program.eval(command)`](#programevalcommand)
    - [`program.run(command)`](#programruncommand)
    - [`program.repl()`](#programrepl)
    - [`program.yargsInstance()`](#programyargsinstance)
  - [`command(name, description)`](#commandname-description)
    - [`command.argument(name, description, options)`](#commandargumentname-description-options)
    - [`command.option(name, description, options)`](#commandoptionname-description-options)
    - [`command.command(command)`](#commandcommandcommand)
    - [`command.default()`](#commanddefault)
    - [`command.action(function)`](#commandactionfunction)
  - [`runner`](#runner)
    - [`runner.then(function)`](#runnerthenfunction)
    - [`runner.catch(function)`](#runnercatchfunction)
    - [`runner.print(printer)`](#runnerprintprinter)
  - [`printer`](#printer)
    - [`printer.write(string)`](#printerwritestring)
    - [`printer.error(Error)`](#printererrorerror)
  - [`ArgumentOptions`](#argumentoptions)
  - [`OptionOptions`](#optionoptions)
- [Bundle](#bundle)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

```bash
# Add dependency
yarn add bandersnatch
```

Now create a simple app `echo.ts`:

```ts
import { program, command } from 'bandersnatch'

const echo = command('echo', 'Echo something in the terminal')
  .argument('words', 'Say some kind words', { variadic: true })
  .action(args => args.words.join(' '))

program()
  .add(echo)
  .run()
```

And run with:

```bash
ts-node echo.ts
```

_👆 Assuming you have `ts-node` installed._

ℹ More examples in the [examples](https://github.com/hongaar/bandersnatch/tree/alpha/examples) directory.

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

Adds `help` and `--help` to program which displays program usage information.

#### `program.withVersion()`

Adds `version` and `--version` to program which displays program version from
package.json.

#### `program.fail(function)`

Use custom error handler. Function will be called with 4 arguments:

- Message (string) will contain internal message about e.g. missing arguments
- Error (Error) is only set when an error was explicitly thrown
- Args (array) contains program arguments
- Usage (string) contains usage information from --help

#### `program.eval(command)`

Uses process.argv or passed in command (string, optional) to match and execute
command. Returns runner instance.

```ts
program()
  .add(command(...))
  .eval()
```

#### `program.run(command)`

Shorthand for `eval().print()`.

```ts
program()
  .add(command(...))
  .run()
```

#### `program.repl()`

Start a read-eval-print loop.

#### `program.yargsInstance()`

Returns internal `yargs` instance. Use with caution.

### `command(name, description)`

Creates a new command.

- Name (string, optional) is used to invoke a command. When
  not used as default command, name is required.
- Description (string, optional) is used in --help output.

#### `command.argument(name, description, options)`

Adds a positional argument to the command.

- Name (string, required) is used to identify the argument.
- Description (string, optional) is used in --help output.
- Options (ArgumentOptions) can be provided to change the behaviour of the
  argument.

#### `command.option(name, description, options)`

Adds an option to the command.

- Name (string, required) is used to identify the option.
- Description (string, optional) is used in --help output.
- Options (OptionOptions) can be provided to change the behaviour of the
  option.

#### `command.command(command)`

Adds a sub-command to the command.

#### `command.default()`

Mark command as default. Default commands are executed immediately and don't require a name.

#### `command.action(function)`

Function to execute when command is invoked. Is called with one argument: an
object containing key/value pairs of parsed arguments and options.

### `runner`

Returned from `program().eval()`, can't be invoked directly.

#### `runner.then(function)`

Function is invoked when command handler resolves.

#### `runner.catch(function)`

Function is invoked when command handler rejects.

#### `runner.print(printer)`

Attaches a printer to the runner. Uses a default printer unless called with a
custom printer argument.

### `printer`

Used by runner, can't be invoked directly.

#### `printer.write(string)`

Handles output. Prints to stdout by default.

#### `printer.error(Error)`

Handles errors. Prints stack trace to stderr by default.

### `ArgumentOptions`

Object with any of these keys:

- `optional` (boolean) makes this argument optional.
- `variadic` (boolean) eagerly take all remaining arguments and parse as array.
  Only valid for last argument.
- ...

### `OptionOptions`

- `alias` (string or array of strings) alias(es) for the option key.
- ...

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

Next, we need to create a simple entrypoint `echo.js`, which can be run with
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

## Contributing

```bash
# Clone and install
git clone git@github.com:hongaar/bandersnatch.git
cd bandersnatch
yarn

# Run an example
yarn start examples/simple.ts
```

## License

Copyright (c) 2019 Joram van den Boezem. Licensed under the MIT license.

---

Inspired by [vorpal](https://vorpal.js.org/)
