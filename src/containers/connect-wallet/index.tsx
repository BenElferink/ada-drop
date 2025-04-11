import React, { FC, Fragment, useEffect, useMemo, useState } from 'react'
import api from '@/utils/api'
import Image from 'next/image'
import { LINKS } from '@/constants'
import { WalletIcon } from '@/icons'
import styled from 'styled-components'
import Theme from '@odigos/ui-kit/theme'
import { logId } from '@/utils/logrocket'
import { StatusType } from '@odigos/ui-kit/types'
import { useNotificationStore } from '@odigos/ui-kit/store'
import { extractError, truncateStringInMiddle } from '@/functions'
import { useAddress, useRewardAddress, useWallet, useWalletList } from '@meshsdk/react'
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

const ConnectButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  const theme = Theme.useTheme()
  const { connected, name } = useWallet()

  const address = useAddress()
  const installedWallets = useWalletList()
  const walletAppInfo = useMemo(() => (!!name ? installedWallets.find((x) => x.id === name) : undefined), [installedWallets, name])

  if (connected)
    return (
      <Button variant='primary' onClick={onClick}>
        <Image src={walletAppInfo?.icon || ''} alt='' width={20} height={20} priority unoptimized />
        {truncateStringInMiddle(address, 7) || '...'}
      </Button>
    )

  return (
    <Button variant='primary' onClick={onClick}>
      <WalletIcon fill={theme.text.primary} size={20} />
      {'Connect Wallet'}
    </Button>
  )
}

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
  const { addNotification } = useNotificationStore()
  const { connect, disconnect, connecting, connected, error } = useWallet()

  const sKey = useRewardAddress()
  const installedWallets = useWalletList()

  const [isOpen, setIsOpen] = useState(false)
  const toggleIsOpen = (bool?: boolean) => setIsOpen((prev) => (typeof bool === 'boolean' ? bool : !prev))

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId)
    } catch (e) {
      addNotification({ type: StatusType.Error, message: extractError(e).message })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    addNotification({ type: StatusType.Success, title: 'Wallet disconnected' })
  }

  useEffect(() => {
    if (connected && sKey) {
      addNotification({ type: StatusType.Success, title: 'Wallet connected' })
      toggleIsOpen(false)

      logId(sKey)
      api.notify('👀 Wallet connected', sKey).then().catch()
    }
  }, [connected, sKey, addNotification])

  useEffect(() => {
    if (error) addNotification({ type: StatusType.Error, title: 'Failed to connect wallet', message: extractError(error).message })
  }, [error, addNotification])

  return (
    <Fragment>
      <ConnectButton onClick={toggleIsOpen} />

      <Drawer
        width={DRAWER_WIDTH}
        isOpen={isOpen}
        onClose={toggleIsOpen}
        header={{ title: 'Connect Wallet', icons: [WalletIcon] }}
        footer={{ isOpen: false }}
      >
        <FlexColumn $gap={12} style={{ alignItems: 'center' }}>
          {!installedWallets.length ? (
            <ErrorNoWallets />
          ) : (
            <Fragment>
              {!!error && (
                <NoteWrapper>
                  <NotificationNote type={StatusType.Error} title='Failed to connect wallet' message={extractError(error).message} />
                </NoteWrapper>
              )}

              {installedWallets
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((w) => {
                  const disabled = connected || connecting

                  return (
                    <DataTab
                      key={`wallet-${w.id}`}
                      title={`${w.name.toLowerCase().replace('wallet', '').trim()}${w.id === 'nufiSnap' ? ' (experimental)' : ''}`}
                      subTitle={`version: ${w.version}`}
                      onClick={!disabled ? () => handleConnect(w.id) : undefined}
                      iconProps={{ iconSrc: w.icon }}
                      visualProps={{ faded: disabled }}
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
