export const chunk = <T = any>(array: T[], size: number): T[][] => {
  if (array.length <= size) {
    return [array]
  }

  return [array.slice(0, size), ...chunk(array.slice(size), size)]
}
