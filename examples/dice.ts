import { command, program } from '../src/index.js'

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

dice.runOrRepl()
