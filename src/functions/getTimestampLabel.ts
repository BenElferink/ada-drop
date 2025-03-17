import { resolveMonthName } from '.'

export const getTimestampLabel = (timestamp: number) => {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = d.getMonth()

  return { label: `${y} ${resolveMonthName(m)}`, startOfmonth: new Date(y, m).getTime() }
}
