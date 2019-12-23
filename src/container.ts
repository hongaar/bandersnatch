type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never

type Resolver = () => Promise<any>

type ResolverMap = {
  [K: string]: any
} & Partial<typeof defaultResolvers>

const defaultResolvers = {
  printer: async () => {
    const { printer } = await import('./printer')
    return printer()
  }
}

export function container() {
  return new Container()
}

export class Container<M extends ResolverMap = ResolverMap> {
  private resolvers: M = {} as M
  private cache: M = {} as M

  withDefaults(): Container<Required<M>> {
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

    return (this as unknown) as Container<M & { [key in K]: R }>
  }

  has<K extends keyof M>(
    key: K
  ): this is Container<Required<{ [key in K]: M[K] }>> {
    return !!this.resolvers[key]
  }

  async resolve<K extends keyof M>(key: K) {
    if (!this.cache[key]) {
      this.cache[key] = await this.resolvers[key]()
    }

    return this.cache[key] as Unpromise<ReturnType<M[K]>>
  }
}
