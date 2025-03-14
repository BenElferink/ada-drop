// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RetryAsync = (err: any, retry: () => Promise<any>, reject: (msg: string) => void) => Promise<any>

export const retryAsync: RetryAsync = async (err, retry, reject) => {
  console.error(err)

  if ([400, 404, 500, 504].includes(err?.response?.status)) {
    return reject(err?.response?.data || err?.message || 'UNKNOWN ERROR')
  } else {
    return await retry()
  }
}
