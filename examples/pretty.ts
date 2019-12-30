import { program, command } from '../src'

const app = program('JSON pretty printer').default(
  command()
    .argument('json', 'Raw JSON input as string')
    .option('color', 'Enables colorized output', { type: 'boolean' })
    .action(async args => {
      const json = JSON.parse(args.json)
      args.color
        ? console.dir(json)
        : console.log(JSON.stringify(json, undefined, 4))
    })
)

process.argv.slice(2).length ? app.run() : app.repl()
