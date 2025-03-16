import { resolveMonthName } from '.'

export const getTimeStampLabel = (timestamp: number) => {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = d.getMonth()

  return { label: `${y} ${resolveMonthName(m)}`, startOfmonth: new Date(y, m).getTime() }
}
