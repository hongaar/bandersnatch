export function option(name: string) {
  return new Option(name)
}

export class Option {
  private name: string
  private description?: string
  private choices?: Function

  constructor(name: string) {
    this.name = name
  }

  describe(description: string) {
    this.description = description
    return this
  }
}
