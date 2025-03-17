export const numbersFromString = (str: string): number | null => {
  const matched = str.match(/\d+/g)

  if (matched?.length) {
    const num = Number(matched.join(''))

    if (!Number.isNaN(num)) return num
  }

  return null
}
