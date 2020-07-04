import { prompt, Question as BaseQuestion, ListQuestion } from 'inquirer'
import { Argument } from './argument'
import { Option } from './option'

type PromptType =
  | 'input'
  | 'number'
  | 'confirm'
  | 'list'
  | 'rawlist'
  | 'expand'
  | 'checkbox'
  | 'password'
  | 'editor'

type Question = BaseQuestion | ListQuestion

/**
 * Creates a new command, which can be added to a program.
 */
export function prompter<T = {}>(baseArgs: Array<Argument | Option>, args: T) {
  return new Prompter(baseArgs, args)
}

export class Prompter<T = {}> {
  constructor(private baseArgs: Array<Argument | Option>, private args: T) {}

  public async prompt() {
    const questions = this.getQuestions(this.args)

    // Short circuit if there are no questions to ask.
    if (!questions.length) {
      return this.args
    }

    // Ask questions and merge with passed in args.
    const answers = await prompt(questions)

    return {
      ...this.args,
      ...answers,
    }
  }

  /**
   * Returns an array of arguments and options which should be prompted, because
   * they are promptable (`isPromptable()` returned true) and they are not
   * provided in the args passed in to this function.
   */
  private getQuestions(args: T) {
    // If we need to prompt for things, fill questions array
    return this.baseArgs.reduce((questions, arg) => {
      const name = arg.getName()
      const defaultValue = arg.getDefault()
      const isPromptable = arg.isPromptable()
      const presentInArgs = Object.constructor.hasOwnProperty.call(args, name)
      const isDefault =
        presentInArgs &&
        typeof defaultValue !== 'undefined' &&
        defaultValue == (args as any)[name]

      // We're going to assume that if an argument/option still has its default
      // value and it is promptable, it should get a prompt.
      if (isPromptable && (!presentInArgs || isDefault)) {
        // Detect the type of question we need to ask
        // @todo add detection of question type based on type of defaultValue
        switch (true) {
          case typeof arg.getChoices() !== 'undefined' &&
            arg.getType() === 'array':
            // Use checkbox question type
            questions.push({
              name,
              type: 'checkbox',
              message: arg.getPrompt(),
              default: defaultValue,
              // @todo ignoring type error here, probably need another type
              // than Question[]
              // @ts-ignore
              choices: arg.getChoices() as string[],
            })
            break

          case typeof arg.getChoices() !== 'undefined':
            // Use list question type
            questions.push({
              name,
              type: 'list',
              message: arg.getPrompt(),
              default: defaultValue,
              choices: arg.getChoices() as string[],
            })
            break

          case arg.getType() == 'boolean':
            // Use confirm question type
            questions.push({
              name,
              type: 'confirm',
              message: arg.getPrompt(),
              default: defaultValue,
            })
            break

          default:
            // Use input question type as default
            questions.push({
              name,
              type: 'input',
              message: arg.getPrompt(),
              default: defaultValue,
            })
        }
      }

      return questions
    }, [] as Question[])
  }
}
