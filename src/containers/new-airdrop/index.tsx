import React, { Fragment, useMemo, useState } from 'react'
import styled from 'styled-components'
import Theme from '@odigos/ui-kit/theme'
import { useWallet } from '@meshsdk/react'
import { PlusIcon } from '@odigos/ui-kit/icons'
import { STATUS_TYPE } from '@odigos/ui-kit/types'
import { HoldersJourney } from './journeys/holders'
import { AirdropMethod } from './steps/airdrop-method'
import { DelegatorsJourney } from './journeys/delegators'
import { CustomListJourney } from './journeys/custom-list'
import { AirdropMethodType, type AirdropSettings } from '@/@types'
import { Button, Modal, NavigationButtons, Stepper, Tooltip, WarningModal } from '@odigos/ui-kit/components'

const DEFAULT_SETTINGS: AirdropSettings = {
  airdropMethod: AirdropMethodType.EMPTY,

  tokenId: '',
  tokenName: {
    onChain: '',
    display: '',
    ticker: '',
  },
  tokenAmount: {
    onChain: 0,
    display: 0,
    decimals: 0,
  },
  thumb: '',

  withHolders: false,
  holderPolicies: [],

  withDelegators: false,
  stakePools: [],

  withBlacklist: false,
  blacklistWallets: [],
  blacklistTokens: [],
}

export const ModalBody = styled.div`
  width: 640px;
  height: calc(100vh - 350px);
  overflow-y: scroll;
`

const SideMenuWrapper = styled.div`
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 32px;
  width: 200px;
  @media (max-width: 1050px) {
    display: none;
  }
`

export const NewAirdrop = () => {
  const theme = Theme.useTheme()
  const { connected } = useWallet()

  const [isOpen, setIsOpen] = useState(false)
  const toggleIsOpen = () => setIsOpen((prev) => !prev)

  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const toggleIsWarningOpen = () => setIsWarningOpen((prev) => !prev)

  const [step, setStep] = useState(1)
  const incrementStep = () => setStep((prev) => prev + 1)
  const decrementStep = () => setStep((prev) => prev - 1)

  const [settings, setSettings] = useState<AirdropSettings>(DEFAULT_SETTINGS)
  // const [payoutRecipients, setPayoutRecipients] = useState<PayoutRecipient[]>([])

  const handleClose = () => {
    // reset data
    setStep(1)
    setSettings(DEFAULT_SETTINGS)
    // setPayoutRecipients([])

    // close modal
    toggleIsWarningOpen()
    toggleIsOpen()
  }

  const callbackSettings = (data: Partial<AirdropSettings>) => setSettings((prev) => ({ ...prev, ...data }))

  const stepData = useMemo(() => {
    if (step === 1)
      return [
        { stepNumber: 1, title: 'Airdrop Method' },
        { stepNumber: 2, title: '...' },
      ]

    switch (settings.airdropMethod) {
      case AirdropMethodType.HolderSnapshot:
        return [
          { stepNumber: 1, title: 'Airdrop Method' },
          { stepNumber: 2, title: 'TODO: development' },
        ]

      case AirdropMethodType.DelegatorSnapshot:
        return [
          { stepNumber: 1, title: 'Airdrop Method' },
          { stepNumber: 2, title: 'TODO: development' },
        ]

      case AirdropMethodType.CustomList:
        return [
          { stepNumber: 1, title: 'Airdrop Method' },
          { stepNumber: 2, title: 'TODO: development' },
        ]

      default:
        return []
    }
  }, [step, settings.airdropMethod])

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
        approveButton={{ text: 'Yes', variant: STATUS_TYPE.WARNING, onClick: handleClose }}
        denyButton={{ text: 'No', onClick: toggleIsWarningOpen }}
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
                label: 'Back',
                onClick: decrementStep,
                disabled: [1].includes(step),
              },
              {
                variant: 'primary',
                label: 'Next',
                onClick: incrementStep,
                disabled: step === 1 && settings.airdropMethod === AirdropMethodType.EMPTY,
              },
            ]}
          />
        }
      >
        <div style={{ display: 'flex' }}>
          <SideMenuWrapper>
            <Stepper currentStep={step} data={stepData} />
          </SideMenuWrapper>

          <ModalBody style={{ padding: '32px' }}>
            {step === 1 ? (
              <AirdropMethod defaultData={settings} callback={callbackSettings} />
            ) : settings.airdropMethod === AirdropMethodType.HolderSnapshot ? (
              <HoldersJourney step={step} defaultData={settings} callback={callbackSettings} />
            ) : settings.airdropMethod === AirdropMethodType.DelegatorSnapshot ? (
              <DelegatorsJourney step={step} defaultData={settings} callback={callbackSettings} />
            ) : settings.airdropMethod === AirdropMethodType.CustomList ? (
              <CustomListJourney step={step} defaultData={settings} callback={callbackSettings} />
            ) : null}
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  )
}
