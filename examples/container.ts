import { program, command } from '../src'

const modules = {
  listr: () => import('listr')
}

const demo = command<typeof modules>(
  'demo',
  'Demo some 3rd party integrations'
).action((args, modules) => {
  console.log({ args, modules })
})

program()
  .bind(modules)
  .default(demo)
  .run()
