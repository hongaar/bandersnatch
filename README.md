# bandersnatch

[![npm](https://img.shields.io/npm/v/bandersnatch)](https://www.npmjs.com/package/bandersnatch)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/hongaar/bandersnatch/ci)](https://github.com/hongaar/bandersnatch/actions?query=workflow%3Aci)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/bandersnatch)](https://bundlephobia.com/result?p=bandersnatch)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/issues)
[![Code Climate coverage](https://img.shields.io/codeclimate/coverage/hongaar/bandersnatch)](https://codeclimate.com/github/hongaar/bandersnatch/code)

> Super lightweight and friendly CLI framework for Node.js.

**🚧 but not quite yet**

## Features

- Built-in REPL
- Prompts for missing arguments
- Autocompletes arguments, options and values
- Fully typed
- Uses the power of `yargs` & `inquirer`

It's built in TypeScript and while it's of course possible to write your app
with JavaScript, you're missing out on some very handy type hints.

We don't have a generator, auto-updater and we don't make any decisions for you
(apart from using inquirer for prompts). This makes bandersnatch pretty easy and
intuitive to work with.

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

_Work in progress_

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

## Development

```bash
# Clone and install
git clone git@github.com:hongaar/bandersnatch.git
cd bandersnatch
yarn

# Run an example
yarn start examples/simple.ts
```

## Todo

- [ ] Correctly type optional and required args
- [ ] Autocomplete in repl mode
- [ ] Remove \$0 from help when in repl mode

---

Inspired by Vorpal
