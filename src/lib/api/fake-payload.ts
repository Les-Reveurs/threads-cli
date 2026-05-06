let fakeApiQueue: Array<unknown> | undefined

export const shiftFakeApiPayload = (): unknown => {
  if (!fakeApiQueue) {
    const fakeQueue = process.env.THREADS_CLI_FAKE_API_QUEUE_JSON
    fakeApiQueue = fakeQueue ? JSON.parse(fakeQueue) as Array<unknown> : []
  }

  return fakeApiQueue.shift()
}

export const readFakeApiPayload = <T>(): T | undefined => {
  const queuedPayload = shiftFakeApiPayload()
  if (queuedPayload !== undefined) {
    return queuedPayload as T
  }

  const fakePayload = process.env.THREADS_CLI_FAKE_API_JSON
  if (!fakePayload) return undefined

  return JSON.parse(fakePayload) as T
}
