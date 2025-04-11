export const fromHex = (hex: string, stopRetry?: boolean): string => {
  try {
    return decodeURIComponent('%' + hex.match(/.{1,2}/g)?.join('%'))
  } catch (error: any) {
    if (!stopRetry) return fromHex(hex.substring(8), true)

    console.error('ERROR decoding hex:', hex, '\n', error?.stack)
    return hex
  }
}

export const toHex = (txt: string) => {
  const str = String(txt)
  let result = ''

  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16)
  }

  return result
}
