import { Container } from './container'
import { Printer } from './printer'

export function runner<T = unknown>(
  executor: Executor<T>,
  container: Container
) {
  return new Runner(executor, container)
}

type Executor<T> = (
  resolve: (value?: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => void

export class Runner<T = unknown> {
  private container: Container
  private executor: Executor<T>
  private ref: Promise<any>;

  readonly [Symbol.toStringTag]: string

  constructor(executor: Executor<T>, container: Container) {
    this.container = container
    this.executor = executor
    this.ref = Promise.resolve()
  }

  eval() {
    this.ref = new Promise(this.executor)
    return this
  }

  then(...args: Parameters<Promise<any>['then']>) {
    this.ref = this.promise().then(...args)
    return this
  }

  catch(...args: Parameters<Promise<any>['catch']>) {
    this.ref = this.promise().catch(...args)
    return this
  }

  finally(...args: Parameters<Promise<any>['finally']>) {
    this.ref = this.promise().finally(...args)
    return this
  }

  print(printer?: Printer) {
    if (printer) {
      this.container.bind('printer', async () => printer)
    }

    return this.then(this.onfulfilled.bind(this), this.onrejected.bind(this))
  }

  /**
   * Retrieve the tail of the promise chain. Note that this isn't guaranteed to
   * be the 'real' tail, just the tail trackable from the Runners perspective.
   */
  private promise() {
    return this.ref
  }

  private async onfulfilled(stdout: unknown) {
    if (this.container.has('printer')) {
      const printer = await this.container.resolve('printer')

      printer.write(stdout)
    } else {
      throw new Error("Can't resolve printer.")
    }
  }

  private async onrejected(stderr: unknown) {
    if (this.container.has('printer')) {
      const printer = await this.container.resolve('printer')

      printer.error(stderr)
    } else {
      throw new Error("Can't resolve printer.")
    }
  }
}
