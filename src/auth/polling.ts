export interface PollResult<T> {
  continue: boolean
  data?: T
  error?: Error
}

export interface PollOptions<T> {
  interval: number
  maxAttempts: number
  pollFn: () => Promise<PollResult<T>>
}

export async function poll<T>(options: PollOptions<T>): Promise<T> {
  let attempt = 0

  while (attempt < options.maxAttempts) {
    const result = await options.pollFn()

    if (!result.continue) {
      if (result.error) {
        throw result.error
      }
      if (result.data === undefined) {
        throw new Error("Polling completed without data")
      }
      return result.data
    }

    attempt += 1
    await new Promise((resolve) => setTimeout(resolve, options.interval))
  }

  throw new Error("Authorization timed out")
}
