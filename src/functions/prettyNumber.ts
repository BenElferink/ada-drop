export const prettyNumber = (num: number | string, decimals?: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals || 0,
    maximumFractionDigits: decimals || 0,
  })
}
