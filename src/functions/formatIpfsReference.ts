export const formatIpfsReference = (str: string) => {
  if (!str) {
    return {
      ipfs: '',
      url: '',
    }
  }

  const strIsUrl = str.indexOf('data:') === 0 || str.indexOf('https://') === 0 || str.indexOf('/') === 0
  const strHasIpfsPrefix = str.indexOf('ipfs://') === 0

  const ipfs = strIsUrl ? '' : strHasIpfsPrefix ? str : `ipfs://${str}`
  const url = strIsUrl ? str : ipfs.replace('ipfs://', 'https://ipfs5.jpgstoreapis.com/ipfs/') + '?s=400'

  return {
    ipfs,
    url,
  }
}
