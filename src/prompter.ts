import enquirer from 'enquirer'
import { Argument } from './argument.js'
import { Option } from './option.js'

/**
 * Workaround for "The requested module 'enquirer' is a CommonJS module, which
 * may not support all module.exports as named exports."
 */
const { prompt } = enquirer

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

// @todo Wait for upstream change to import types from enquirer
// @link https://github.com/enquirer/enquirer/pull/258
type Question = any

/**
 * Creates a new prompter instance
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
        switch (true) {
          case typeof arg.getChoices() !== 'undefined' &&
            (arg.getType() === 'array' || Array.isArray(defaultValue)):
            // Use checkbox question type
            questions.push({
              name,
              type: 'multiselect',
              message: arg.getPrompt(),
              initial: defaultValue,
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
              type: 'select',
              message: arg.getPrompt(),
              initial: defaultValue,
              choices: arg.getChoices() as string[],
            })
            break

          case arg.getType() === 'boolean' || typeof defaultValue === 'boolean':
            // Use confirm question type
            questions.push({
              name,
              type: 'confirm',
              message: arg.getPrompt(),
              initial: defaultValue,
            })
            break

          default:
            // Use input question type as default
            questions.push({
              name,
              type: 'input',
              message: arg.getPrompt(),
              initial: defaultValue,
            })
        }
      }

      return questions
    }, [] as Question[])
  }
}
