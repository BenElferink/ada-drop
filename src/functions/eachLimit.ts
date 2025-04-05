export const eachLimit = async <T = any>(collection: T[], limit: number, iteratee: (items: T) => Promise<void>) => {
  const results: any = []

  const processItem = async (index: number) => {
    if (index >= collection.length) {
      return
    }

    const result = await iteratee(collection[index])

    results[index] = result

    await processItem(index + limit)
  }

  await Promise.all(
    Array.from({ length: limit }).map(async (_, i) => {
      await processItem(i)
    })
  )

  return results
}
