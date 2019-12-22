export function printer() {
  return new Printer()
}

export class Printer {
  write(str: { toString(): string }) {
    console.log(str.toString())
  }
}
