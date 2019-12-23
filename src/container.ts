type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never

type Resolver = () => Promise<any>

export type ResolverMap = {
  [K: string]: Resolver
}

export type DefaultResolvers = typeof defaultResolvers

const defaultResolvers = {
  printer: async () => {
    const { printer } = await import('./printer')
    return printer()
  }
}

export function container() {
  return new Container()
}

export class Container<T extends ResolverMap = {}> {
  private resolvers: T = {} as T
  private cache: T = {} as T

  withDefaults(): Container<T & typeof defaultResolvers> {
    this.resolvers = {
      ...this.resolvers,
      ...defaultResolvers
    }

    return this as any
  }

  bind<K extends string, R extends Resolver>(key: K, resolver: R) {
    this.resolvers = {
      ...this.resolvers,
      [key]: resolver
    }

    return (this as unknown) as Container<T & { [key in K]: R }>
  }

  has<K extends keyof T>(key: K): this is Container<{ [key in K]: T[K] }> {
    return !!this.resolvers[key]
  }

  async resolve<K extends keyof T>(key: K) {
    if (!this.cache[key]) {
      this.cache[key] = await this.resolvers[key]()
    }

    return this.cache[key] as Unpromise<ReturnType<T[K]>>
  }

  async resolveAll(): Promise<T> {
    return this.cache as T
  }
}
