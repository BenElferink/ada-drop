import React, { Fragment, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import Theme from '@odigos/ui-kit/theme'
import { useWallet } from '@meshsdk/react'
import { PlusIcon } from '@odigos/ui-kit/icons'
import { StatusType } from '@odigos/ui-kit/types'
import { INIT_AIRDROP_SETTINGS } from '@/constants'
import { HoldersJourney } from './journeys/holders'
import { deepClone } from '@odigos/ui-kit/functions'
import { AirdropMethod } from './steps/airdrop-method'
import { DelegatorsJourney } from './journeys/delegators'
import { CustomListJourney } from './journeys/custom-list'
import { AirdropMethodType, FormRef, type AirdropSettings } from '@/@types'
import { Button, FlexColumn, Modal, NavigationButtons, NotificationNote, Stepper, Tooltip, WarningModal } from '@odigos/ui-kit/components'

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

  const [formError, setFormError] = useState({ isOk: true, message: '' })
  const [settings, setSettings] = useState<AirdropSettings>(deepClone<AirdropSettings>(INIT_AIRDROP_SETTINGS))
  const formRef = useRef<FormRef>({
    validate: () => Promise.resolve({ isOk: true, message: '' }),
    getData: () => deepClone<AirdropSettings>(INIT_AIRDROP_SETTINGS),
  })

  // const [payoutRecipients, setPayoutRecipients] = useState<PayoutRecipient[]>([])

  const handleClose = () => {
    // reset data
    setStep(1)
    setSettings(deepClone<AirdropSettings>(INIT_AIRDROP_SETTINGS))
    setFormError({ isOk: true, message: '' })
    // setPayoutRecipients([])

    // close modal
    toggleIsWarningOpen()
    toggleIsOpen()
  }

  const stepData = useMemo(() => {
    if (step === 1)
      return [
        { stepNumber: 1, title: 'Airdrop Method' },
        { stepNumber: 2, title: 'Choose Token' },
        { stepNumber: 4, title: '...' },
      ]

    switch (settings.airdropMethod) {
      case AirdropMethodType.HolderSnapshot:
        return [
          { stepNumber: 1, title: 'Airdrop Method' },
          { stepNumber: 2, title: 'Choose Token' },
          { stepNumber: 3, title: 'Policy IDs' },
          { stepNumber: 4, title: 'Blacklist' },
          { stepNumber: 5, title: 'Run Snapshot' },
          { stepNumber: 6, title: 'Run Payout' },
        ]

      case AirdropMethodType.DelegatorSnapshot:
        return [
          { stepNumber: 1, title: 'Airdrop Method' },
          { stepNumber: 2, title: 'Choose Token' },
          { stepNumber: 3, title: 'Stake Pools' },
          { stepNumber: 4, title: 'Blacklist' }, // !! code into step 6 & 7
          { stepNumber: 5, title: 'Run Snapshot' },
          { stepNumber: 6, title: 'Run Payout' },
        ]

      case AirdropMethodType.CustomList:
        return [
          { stepNumber: 1, title: 'Airdrop Method' },
          { stepNumber: 2, title: 'Choose Token' },
          { stepNumber: 3, title: 'Upload File' },
          { stepNumber: 4, title: 'Run Payout' },
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
        approveButton={{ text: 'Yes', variant: StatusType.Warning, onClick: handleClose }}
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
                disabled: [1].includes(step),
                onClick: () => {
                  setFormError({ isOk: true, message: '' })
                  decrementStep()
                },
              },
              {
                variant: 'primary',
                label: 'Next',
                disabled:
                  (settings.airdropMethod === AirdropMethodType.HolderSnapshot && step === 6) ||
                  (settings.airdropMethod === AirdropMethodType.DelegatorSnapshot && step === 6) ||
                  (settings.airdropMethod === AirdropMethodType.CustomList && step === 4),
                onClick: () => {
                  setFormError({ isOk: true, message: '' })
                  formRef.current?.validate().then(({ isOk, message }) => {
                    if (isOk) {
                      setFormError({ isOk, message: '' })
                      setSettings((prev) => ({ ...prev, ...formRef.current.getData() }))
                      incrementStep()
                    } else {
                      setFormError({ isOk, message })
                    }
                  })
                },
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
            <FlexColumn $gap={16}>
              {!formError.isOk && !!formError.message && (
                <div style={{ width: '100%' }}>
                  <NotificationNote type={StatusType.Warning} title='Cannot proceed to next step' message={formError.message} />
                </div>
              )}

              {step === 1 ? (
                <AirdropMethod ref={formRef} defaultData={settings} />
              ) : settings.airdropMethod === AirdropMethodType.HolderSnapshot ? (
                <HoldersJourney ref={formRef} step={step} defaultData={settings} />
              ) : settings.airdropMethod === AirdropMethodType.DelegatorSnapshot ? (
                <DelegatorsJourney ref={formRef} step={step} defaultData={settings} />
              ) : settings.airdropMethod === AirdropMethodType.CustomList ? (
                <CustomListJourney ref={formRef} step={step} defaultData={settings} />
              ) : null}
            </FlexColumn>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  )
}
