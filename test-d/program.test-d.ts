import { expectType } from 'tsd'
import { command } from '../src/command'
import { Program, program } from '../src/program'
import { Repl } from '../src/repl'

const app = program()

expectType<Program>(app)

// Chainable methods
expectType<Program>(app.description('foo'))
expectType<Program>(app.prompt('foo'))
expectType<Program>(app.add(command()))
expectType<Program>(app.default(command()))
expectType<Program>(app.on('run', undefined))

// Run methods
expectType<Promise<unknown>>(app.run('foo'))
expectType<Promise<unknown>>(app.run(['foo', 'bar']))
expectType<Promise<unknown>>(app.run())
expectType<Repl>(app.repl())
expectType<Repl | Promise<unknown>>(app.runOrRepl())

// Getters
expectType<boolean>(app.isRepl())
expectType<boolean>(app.isRepl())
