import { createPromptModule, PromptModule } from 'inquirer'
import { Program } from './program'

export class Repl {
  private program: Program
  private prefix: string
  private prompt: PromptModule

  constructor(program: Program, prefix: string = '>') {
    this.program = program
    this.prefix = prefix
    this.prompt = createPromptModule()
  }

  async run() {
    const stdin = await this.read()
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

  private eval(stdin: string) {
    return Promise.resolve(null)
  }

  private print() {}

  private loop() {}
}
