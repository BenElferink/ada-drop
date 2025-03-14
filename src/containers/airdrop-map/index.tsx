import React, { useEffect, useState } from 'react'
import { useAirdrops } from '@/hooks'
// import resolveMonthName from '@/functions/resolveMonthName'
import { CenterThis, FadeLoader } from '@odigos/ui-kit/components'
import type { Airdrop } from '@/@types'

export const AirdropMap = () => {
  const { airdrops } = useAirdrops()
  const [airdropTimeline, setAirdropTimeline] = useState<{
    [year: string]: {
      [month: string]: Airdrop[]
    }
  } | null>(null)

  useEffect(() => {
    if (!!airdrops.length) {
      const payload: typeof airdropTimeline = {}

      airdrops.forEach((item) => {
        const date = new Date(item.timestamp)
        const y = date.getFullYear().toString()
        const m = date.getMonth().toString()

        if (payload[y]) {
          if (payload[y][m]) {
            payload[y][m].push(item)
          } else {
            payload[y][m] = [item]
          }
        } else {
          payload[y] = { [m]: [item] }
        }
      })

      setAirdropTimeline(payload)
    }
  }, [airdrops])

  console.log('airdropTimeline', airdropTimeline)

  return (
    <>
      {/* {!airdropTimeline ? ( */}
      <CenterThis style={{ height: '50vh' }}>
        <FadeLoader scale={1.5} />
      </CenterThis>
      {/* ) : (
        Object.entries(airdropTimeline).map(([year, months]) =>
          Object.entries(months).map(([month, drops]) => (
            <div key={`year-${year}-month-${month}`} className='my-2'>
              <div>
                {resolveMonthName(month)} - {year}
              </div>

              <div>
                {drops.map((drop) => (
                  <div key={`drop-${drop.id}`}>
                    {drop.tokenName.display}: {drop.tokenAmount.display}
                  </div>
                ))}
              </div>
            </div>
          ))
        )
      )} */}
    </>
  )
}
