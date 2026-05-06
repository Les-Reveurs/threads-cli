export class CliError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CliError'
    this.code = code
  }
}

export const ensureValue = (value: string | undefined, message: string, code: string): string => {
  if (!value) {
    throw new CliError(code, message)
  }

  return value
}
