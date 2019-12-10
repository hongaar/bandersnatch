import { bandersnatch, command } from '../src'

const app = bandersnatch('simple cli app')

app.add(
  command('say').runs(function(argv: any) {
    console.log(argv)
  })
)

app.run()
