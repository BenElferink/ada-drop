import type { NextApiRequest, NextApiResponse } from 'next'
import { ADA } from '@/constants'
import type { Airdrop, PopulatedToken, TokenId } from '@/@types'
import { firestore } from '@/utils/firebase'
import populateToken from '@/functions/backend/populateToken'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const coll = firestore.collection('airdrops')
        const { docs } = await coll.get()

        const batch = firestore.batch()
        const populatedTokens: Record<TokenId, PopulatedToken> = {}

        for await (const doc of docs) {
          const a = doc.data() as Airdrop
          const isLovelace = a.tokenId === 'lovelace'

          // migrate from old ADA image
          if (isLovelace && (a.thumb === 'ada.png' || a.thumb === 'https://labs.badfoxmc.com/media/ada.png')) {
            a.thumb = ADA['THUMB']
          }

          // sync token metadata
          if (!isLovelace) {
            if (!populatedTokens[a.tokenId] && !isLovelace) populatedTokens[a.tokenId] = await populateToken(a.tokenId)
            const { tokenName, image } = populatedTokens[a.tokenId]

            a.tokenName = tokenName
            a.thumb = image.ipfs || image.url
          }

          batch.update(coll.doc(doc.id), a)
        }

        await batch.commit()
        return res.status(204).end()
      }

      default: {
        res.setHeader('Allow', 'POST')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
