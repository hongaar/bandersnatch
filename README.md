# bandersnatch

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
  .action(function(args) {
    console.log(args.words.join(' '))
  })

program()
  .add(echo)
  .run()
```

More examples in https://github.com/hongaar/bandersnatch/tree/master/examples

## Development

```bash
# Clone and install
git clone git@github.com:hongaar/bandersnatch.git
cd bandersnatch
yarn

# Run an example
yarn start examples/simple.ts
```

## API

_Work in progress_

## Todo

- [ ] Autocomplete in repl mode
- [ ] Remove \$0 from help when in repl mode

---

Inspired by Vorpal
