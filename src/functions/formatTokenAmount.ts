export const formatTokenAmountFromChain = (amount: number | string, decimals: number): number => {
  return Math.floor(Number(amount || 0) / Number(`1${new Array(decimals).fill(0).join('')}`))
}

export const formatTokenAmountToChain = (amount: number | string, decimals: number): number => {
  return Math.floor(Number(amount || 0) * Number(`1${new Array(decimals).fill(0).join('')}`))
}
