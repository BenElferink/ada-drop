const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const resolveMonthName = (monthIndex: number | string) => {
  const num = Number(monthIndex)

  if (isNaN(num)) {
    return monthIndex
  }

  return monthNames[num]
}
