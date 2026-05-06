export class ThreadsCliError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ThreadsCliError'
    this.code = code
  }
}

export const ensureValue = (value: string | undefined, message: string, code: string): string => {
  if (!value) {
    throw new ThreadsCliError(code, message)
  }

  return value
}
