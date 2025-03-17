import React, { Fragment, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { LINKS } from '@/constants'
import { WalletIcon } from '@/icons'
import styled from 'styled-components'
import Theme from '@odigos/ui-kit/theme'
import { NOTIFICATION_TYPE } from '@odigos/ui-kit/types'
import { useNotificationStore } from '@odigos/ui-kit/store'
import { extractError, truncateStringInMiddle } from '@/functions'
import { useAddress, useWallet, useWalletList } from '@meshsdk/react'
import { Button, DataTab, Drawer, FlexColumn, NotificationNote, Text } from '@odigos/ui-kit/components'

const DRAWER_WIDTH = '600px'

const WideButton = styled(Button)`
  width: 500px;
`

const NoteWrapper = styled.div`
  width: 100%;
  & > div {
    width: 100%;
  }
`

const ErrorNoWallets = () => {
  return (
    <FlexColumn $gap={12} style={{ alignItems: 'center' }}>
      <Text>{'No wallets installed...'}</Text>
      <WideButton variant='primary' onClick={() => window.open(LINKS['GET_WALLET'], '_blank', 'noopener noreferrer')}>
        Get a Wallet
      </WideButton>
    </FlexColumn>
  )
}

export const ConnectWallet = () => {
  const theme = Theme.useTheme()
  const { addNotification } = useNotificationStore()
  const { connect, disconnect, connecting, connected, name, error } = useWallet()

  const address = useAddress()
  const installedWallets = useWalletList()
  const walletAppInfo = useMemo(() => (!!name ? installedWallets.find((x) => x.id === name) : undefined), [installedWallets, name])

  const [isOpen, setIsOpen] = useState(false)
  const toggleIsOpen = () => setIsOpen((prev) => !prev)

  const handleConnect = async (walletId: string) => {
    await connect(walletId)
  }

  const handleDisconnect = () => {
    disconnect()
    addNotification({ type: NOTIFICATION_TYPE.SUCCESS, title: 'Wallet disconnected' })
  }

  useEffect(() => {
    if (connected) addNotification({ type: NOTIFICATION_TYPE.SUCCESS, title: 'Wallet connected' })
  }, [connected, addNotification])

  useEffect(() => {
    if (error) addNotification({ type: NOTIFICATION_TYPE.ERROR, title: 'Failed to connect wallet', message: extractError(error).message })
  }, [error, addNotification])

  const renderButton = () => {
    if (connected)
      return (
        <Button variant='primary' onClick={toggleIsOpen}>
          <Image src={walletAppInfo?.icon || ''} alt='' width={20} height={20} priority unoptimized />
          {truncateStringInMiddle(address, 7) || '...'}
        </Button>
      )

    return (
      <Button variant='primary' onClick={toggleIsOpen}>
        <WalletIcon fill={theme.text.primary} size={20} />
        {'Connect Wallet'}
      </Button>
    )
  }

  return (
    <Fragment>
      {renderButton()}

      <Drawer
        width={DRAWER_WIDTH}
        isOpen={isOpen}
        onClose={toggleIsOpen}
        header={{ title: 'Connect Wallet', icon: WalletIcon }}
        footer={{ isOpen: false }}
      >
        <FlexColumn $gap={12} style={{ alignItems: 'center' }}>
          {!installedWallets.length ? (
            <ErrorNoWallets />
          ) : (
            <Fragment>
              {!!error && (
                <NoteWrapper>
                  <NotificationNote type={NOTIFICATION_TYPE.ERROR} title='Failed to connect wallet' message={extractError(error).message} />
                </NoteWrapper>
              )}

              {installedWallets.map((w) => {
                const disabled = connected || connecting

                return (
                  <DataTab
                    key={`wallet-${w.id}`}
                    iconSrc={w.icon}
                    title={`${w.name.toLowerCase().replace('wallet', '').trim()}${w.id === 'nufiSnap' ? ' (experimental)' : ''}`}
                    subTitle={`version: ${w.version}`}
                    onClick={!disabled ? () => handleConnect(w.id) : undefined}
                    faded={disabled}
                  />
                )
              })}

              {connected && (
                <WideButton variant='primary' disabled={!connected || connecting} onClick={handleDisconnect}>
                  Disconnect
                </WideButton>
              )}
            </Fragment>
          )}
        </FlexColumn>
      </Drawer>
    </Fragment>
  )
}
