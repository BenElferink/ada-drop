export const formatIpfsReference = (str: string) => {
  if (!str) {
    return {
      ipfs: '',
      url: '',
    }
  }

  const strIsIpfs = str.startsWith('ipfs:')
  const strIsUrl = str.startsWith('data:') || str.startsWith('https:') || str.startsWith('/')

  let ipfs = ''
  if (strIsIpfs) {
    ipfs = str
  } else if (!strIsUrl) {
    ipfs = `ipfs://${str}`
  }

  let url = ''
  if (strIsUrl) {
    url = str
  } else {
    // url = ipfs.replace('ipfs://', 'https://ipfs5.jpgstoreapis.com/ipfs/') + '?s=400'
    url = ipfs.replace('ipfs://', 'https://ipfs.blockfrost.dev/ipfs/')
  }

  return {
    ipfs,
    url,
  }
}
