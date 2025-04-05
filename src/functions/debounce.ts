type AnyFunction<T = any> = (...args: any[]) => T

export const debounce = <T extends AnyFunction>(func: T, wait: number): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  let timeout: ReturnType<typeof setTimeout> | null
  let resolveList: ((value: Awaited<ReturnType<T>>) => void)[] = []

  return (...args) => {
    return new Promise((resolve) => {
      if (timeout) clearTimeout(timeout)

      resolveList.push(resolve)

      timeout = setTimeout(async () => {
        const result = await func(...args)
        resolveList.forEach((res) => res(result))
        resolveList = []
        timeout = null
      }, wait)
    })
  }
}
