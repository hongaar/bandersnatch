import { expectType } from 'tsd'
import { Program, program } from '../src/program'

const app = program()

expectType<Program>(app)
