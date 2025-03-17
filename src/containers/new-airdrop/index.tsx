import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import Theme from '@odigos/ui-kit/theme'
import { useWallet } from '@meshsdk/react'
import { PlusIcon } from '@odigos/ui-kit/icons'
import { Button, CenterThis, Modal, NavigationButtons, Text, Tooltip, WarningModal } from '@odigos/ui-kit/components'
import { NOTIFICATION_TYPE } from '@odigos/ui-kit/types'

export const ModalBody = styled.div`
  width: 640px;
  height: calc(100vh - 350px);
  overflow-y: scroll;
`

export const NewAirdrop = () => {
  const theme = Theme.useTheme()
  const { connected } = useWallet()

  const [isOpen, setIsOpen] = useState(false)
  const toggleIsOpen = () => setIsOpen((prev) => !prev)

  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const toggleIsWarningOpen = () => setIsWarningOpen((prev) => !prev)

  return (
    <Fragment>
      <Tooltip text={!connected ? 'Wallet must be connected to process a new airdrop' : ''}>
        <Button variant='primary' onClick={toggleIsOpen} disabled={!connected}>
          <PlusIcon fill={!connected ? theme.text.secondary : theme.text.primary} size={20} />
          {'New Airdrop'}
        </Button>
      </Tooltip>

      <WarningModal
        isOpen={isWarningOpen}
        noOverlay
        title='Cancel Airdrop'
        description='Are you sure you want to cancel this airdrop?'
        approveButton={{
          text: 'Yes',
          variant: NOTIFICATION_TYPE.WARNING,
          onClick: () => {
            toggleIsWarningOpen()
            toggleIsOpen()
          },
        }}
        denyButton={{
          text: 'No',
          onClick: toggleIsWarningOpen,
        }}
      />

      <Modal
        isOpen={isOpen}
        onClose={toggleIsWarningOpen}
        header={{ title: 'New Airdrop' }}
        actionComponent={
          <NavigationButtons
            buttons={[
              {
                variant: 'primary',
                label: 'Next',
                onClick: () => alert('TODO: development'),
                disabled: false,
              },
            ]}
          />
        }
      >
        <ModalBody>
          <CenterThis style={{ height: '70%' }}>
            <Text>{'TODO: development'}</Text>
          </CenterThis>
        </ModalBody>
      </Modal>
    </Fragment>
  )
}
