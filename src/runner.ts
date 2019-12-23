import { Printer, printer as createPrinter } from './printer'

export function runner<T = unknown>(executor: Executor<T>) {
  return new Runner(executor)
}

type Executor<T> = (
  resolve: (value?: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => void

export class Runner<T = unknown> {
  private ref: Promise<any>;

  readonly [Symbol.toStringTag]: string

  constructor(
    private executor: Executor<T>,
    private printer: Printer = createPrinter()
  ) {
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
      this.printer = printer
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
    this.printer.write(stdout)
  }

  private async onrejected(stderr: unknown) {
    this.printer.error(stderr)
  }
}
