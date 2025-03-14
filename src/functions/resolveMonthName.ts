type ResolveMonthName = (monthIndex: number | string) => string

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const resolveMonthName: ResolveMonthName = (monthIndex) => {
  const num = Number(monthIndex)

  if (isNaN(num) || num < 0 || num > 11) {
    return monthIndex.toString()
  }

  return monthNames[num]
}
