'use client'

import React, { type PropsWithChildren } from 'react'
import dynamic from 'next/dynamic'
import { TITLE } from '@/constants'

const ThemeProvider = dynamic(() => import('@/utils/theme-provider'), { ssr: false })

function Layout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/cardano.svg' />
        <link rel='manifest' href='/manifest.json' />

        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='author' content='Ben Elferink' />
        <meta name='keywords' content='cardano, ada, blockchain, airdrop, tool, coin, token, nft, web3' />
        <meta name='description' content='Airdrop tool for the Cardano Blockchain' />

        <title>{TITLE}</title>
      </head>

      <body suppressHydrationWarning={true} style={{ margin: 0, padding: 0 }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

export default Layout
