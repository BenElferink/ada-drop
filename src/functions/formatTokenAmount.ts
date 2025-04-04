export const formatTokenAmountFromChain = (amount: number | string, decimals: number, floorIt: boolean = true): number => {
  const n = Number(amount || 0) / Number(`1${new Array(decimals).fill(0).join('')}`)
  return floorIt ? Math.floor(n) : n
}

export const formatTokenAmountToChain = (amount: number | string, decimals: number, floorIt: boolean = true): number => {
  const n = Number(amount || 0) * Number(`1${new Array(decimals).fill(0).join('')}`)
  return floorIt ? Math.floor(n) : n
}
