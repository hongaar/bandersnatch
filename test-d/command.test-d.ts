import { expectType } from 'tsd'
import { Command, command } from '../src/command'

const cmd = command()

expectType<Command>(cmd)
