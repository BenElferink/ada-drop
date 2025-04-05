export const fromHex = (hex: string) => {
  try {
    return decodeURIComponent('%' + hex.match(/.{1,2}/g)?.join('%'))
  } catch (error: any) {
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
