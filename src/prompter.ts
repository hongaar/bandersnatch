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
      const presentInArgs = Object.constructor.hasOwnProperty.call(args, name)

      // We're going to assume that if an argument/option still has its default
      // value and it is promptable, it should have a question.
      const defaultInArgs =
        presentInArgs &&
        arg.getDefault() &&
        arg.getDefault() == (args as any)[name]

      if (arg.isPromptable() && (!presentInArgs || defaultInArgs)) {
        // Detect the type of question we need to ask
        if (arg.getChoices()) {
          // Use list question type
          questions.push({
            name,
            type: 'list',
            message: arg.getPrompt(),
            choices: arg.getChoices() as string[],
          })
        } else if (arg.getType() == 'boolean') {
          // Use list question type
          questions.push({
            name,
            type: 'list',
            message: arg.getPrompt(),
            choices: [
              {
                value: true,
                name: 'Yes',
              },
              {
                value: false,
                name: 'No',
              },
            ],
          })
        } else {
          // Default question type is input
          questions.push({
            name,
            type: '',
            message: arg.getPrompt(),
          })
        }
      }

      return questions
    }, [] as Question[])
  }
}
