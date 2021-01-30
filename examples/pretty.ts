import { command, program } from '../src'

const app = program()
  .description('JSON pretty printer')
  .default(
    command()
      .description('Raw JSON input as string')
      .argument('json')
      .option('color', {
        description: 'Enables colorized output',
        type: 'boolean',
      })
      .action(async (args) => {
        const json = JSON.parse(args.json)
        args.color
          ? console.dir(json)
          : console.log(JSON.stringify(json, undefined, 4))
      })
  )

app.runOrRepl()
