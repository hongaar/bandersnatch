type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never

type Resolver = () => Promise<any>

type ResolverMap = {
  [K: string]: any
}

export function container() {
  return new Container()
}

export class Container<M extends ResolverMap = {}> {
  private map: M = {} as M

  bind<K extends string, R extends Resolver>(key: K, resolver: R) {
    this.map = {
      ...this.map,
      [key]: resolver
    }

    return (this as unknown) as Container<
      M & { [key in K]: Unpromise<ReturnType<R>> }
    >
  }

  async resolve<K extends string>(key: K) {
    return (await this.map[key]()) as M[K]
  }
}

const x = container().bind('test', () => import('./program'))
const y = x.resolve('test')
