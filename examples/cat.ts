import { readFileSync } from 'fs'
import { command, program } from '../src'

const cat = command('cat')
  .description('Concatenate files')
  .argument('files', { variadic: true })
  .action(({ files }) =>
    console.log(
      files.reduce((str, file) => str + readFileSync(file, 'utf8'), '')
    )
  )

program()
  .default(cat)
  .run()
  .catch((err) => {
    console.error(`There was a problem running this command:\n${String(err)}`)
    process.exit(1)
  })
