import { bandersnatch, Command } from '../src'

const app = bandersnatch('simple cli app')

app.add(
  new Command('say <something>').runs(function(argv: any) {
    console.log(argv)
  })
)

app.run()
