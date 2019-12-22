import { createPromptModule, PromptModule } from 'inquirer'
import { Program } from './program'
import { red } from 'ansi-colors'

export function repl(program: Program, prefix: string = '>') {
  return new Repl(program, prefix)
}

export class Repl {
  private program: Program
  private prefix: string
  private prompt: PromptModule
  private lastError: string | null = null

  constructor(program: Program, prefix: string = '>') {
    this.program = program
    this.prefix = prefix
    this.prompt = createPromptModule()
  }

  async loop() {
    await this.tick()
    await this.loop()
  }

  setError(err: string) {
    // Only display one error per tick
    if (!this.lastError) {
      this.lastError = err
      console.error(red(err))
    }
  }

  private async tick() {
    const stdin = await this.read()
    this.lastError = null
    await this.eval(stdin)
  }

  /**
   * Prompt the user for a command.
   */
  private async read() {
    // Inquirers default behaviour is to prefix the message with a space.
    // See https://github.com/SBoudrias/Inquirer.js/issues/677
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'stdin',
        message: this.prefix,
        prefix: '',
        suffix: ''
      }
    ])
    return answers.stdin as string
  }

  private async eval(stdin: string) {
    return this.program.run(stdin)
  }

  private async print() {
    // Here just for completeness.
  }
}
