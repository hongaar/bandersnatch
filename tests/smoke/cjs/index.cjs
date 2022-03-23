const { command, program } = require('bandersnatch')

const app = program()

app.default(
  command('echo')
    .argument('arg1')
    .action((args) => console.log(args.arg1))
)

app.run()
