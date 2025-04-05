import React, { Fragment, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import styled from 'styled-components'
import Theme from '@odigos/ui-kit/theme'
import { useWallet } from '@meshsdk/react'
import { PlusIcon } from '@odigos/ui-kit/icons'
import { useKeyDown } from '@odigos/ui-kit/hooks'
import { INIT_AIRDROP_SETTINGS } from '@/constants'
import { HoldersJourney } from './journeys/holders'
import { deepClone } from '@odigos/ui-kit/functions'
import { AirdropMethod } from './steps/airdrop-method'
import { DelegatorsJourney } from './journeys/delegators'
import { CustomListJourney } from './journeys/custom-list'
import { AirdropMethodType, type FormRef, type PayoutRecipient, type AirdropSettings } from '@/@types'
import { Button, FlexColumn, FlexRow, Modal, NavigationButtons, Stepper, Text, Tooltip, WarningModal } from '@odigos/ui-kit/components'

export const ModalBody = styled.div`
  width: 640px;
  height: calc(100vh - 350px);
  overflow-y: scroll;
`

const SideMenuWrapper = styled.div`
  border-right: 1px solid
    ${({ theme }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (theme as any).colors.border};
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

  const [isUnfrackOpen, setIsUnfrackOpen] = useState(false)
  const toggleIsUnfrackOpen = () => setIsUnfrackOpen((prev) => !prev)

  const [step, setStep] = useState(1)
  const incrementStep = () => setStep((prev) => prev + 1)
  const decrementStep = () => setStep((prev) => prev - 1)

  const [settings, setSettings] = useState<AirdropSettings>(deepClone<AirdropSettings>(INIT_AIRDROP_SETTINGS))
  const formRef = useRef<FormRef>({
    validate: () => Promise.resolve(false),
    getData: () => deepClone<AirdropSettings>(INIT_AIRDROP_SETTINGS),
  })

  const [payoutRecipients, setPayoutRecipients] = useState<PayoutRecipient[]>([])

  const handleClose = () => {
    // reset data
    setStep(1)
    setSettings(deepClone<AirdropSettings>(INIT_AIRDROP_SETTINGS))
    setPayoutRecipients([])

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
          { stepNumber: 4, title: 'Blacklist' },
          { stepNumber: 5, title: 'Run Snapshot' },
          { stepNumber: 6, title: 'Run Payout' },
        ]

      case AirdropMethodType.CustomList:
        return [
          { stepNumber: 1, title: 'Airdrop Method' },
          { stepNumber: 2, title: 'Choose Token' },
          { stepNumber: 3, title: 'Load File' },
          { stepNumber: 4, title: 'Run Payout' },
        ]

      default:
        return []
    }
  }, [step, settings.airdropMethod])

  const backDisabled =
    step === 1 ||
    (settings.airdropMethod === AirdropMethodType.HolderSnapshot && [5, 6].includes(step)) ||
    (settings.airdropMethod === AirdropMethodType.DelegatorSnapshot && [5, 6].includes(step)) ||
    (settings.airdropMethod === AirdropMethodType.CustomList && [4].includes(step))

  const nextDisabled =
    (settings.airdropMethod === AirdropMethodType.HolderSnapshot && step === 6) ||
    (settings.airdropMethod === AirdropMethodType.DelegatorSnapshot && step === 6) ||
    (settings.airdropMethod === AirdropMethodType.CustomList && step === 4)

  const onNext = () => {
    if (nextDisabled) return

    formRef.current?.validate().then((isOk) => {
      if (isOk) {
        if (step === 1) {
          // reset when swithching methods
          setSettings({ ...deepClone<AirdropSettings>(INIT_AIRDROP_SETTINGS), ...formRef.current.getData() })
          setPayoutRecipients([])
        } else {
          setSettings((prev) => ({ ...prev, ...formRef.current.getData() }))
        }

        incrementStep()
      }
    })
  }

  useKeyDown({ active: isOpen, key: 'Enter' }, onNext)

  return (
    <Fragment>
      <Tooltip text={!connected ? 'Wallet must be connected to process a new airdrop' : ''}>
        <Button
          variant='primary'
          onClick={() => {
            toggleIsOpen()
            toggleIsUnfrackOpen()
          }}
          disabled={!connected}
        >
          <PlusIcon fill={!connected ? theme.text.secondary : theme.text.primary} size={20} />
          {'New Airdrop'}
        </Button>
      </Tooltip>

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
                disabled: backDisabled,
                onClick: decrementStep,
              },
              {
                variant: 'primary',
                label: `Next (${String.fromCodePoint(0x21b5)})`,
                disabled: nextDisabled,
                onClick: onNext,
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
              {step === 1 ? (
                <AirdropMethod ref={formRef} defaultData={settings} />
              ) : settings.airdropMethod === AirdropMethodType.HolderSnapshot ? (
                <HoldersJourney
                  ref={formRef}
                  step={step}
                  defaultData={settings}
                  payoutRecipients={payoutRecipients}
                  setPayoutRecipients={setPayoutRecipients}
                />
              ) : settings.airdropMethod === AirdropMethodType.DelegatorSnapshot ? (
                <DelegatorsJourney
                  ref={formRef}
                  step={step}
                  defaultData={settings}
                  payoutRecipients={payoutRecipients}
                  setPayoutRecipients={setPayoutRecipients}
                />
              ) : settings.airdropMethod === AirdropMethodType.CustomList ? (
                <CustomListJourney
                  ref={formRef}
                  step={step}
                  defaultData={settings}
                  payoutRecipients={payoutRecipients}
                  setPayoutRecipients={setPayoutRecipients}
                />
              ) : null}
            </FlexColumn>
          </ModalBody>
        </div>
      </Modal>

      <WarningModal
        isOpen={isWarningOpen}
        noOverlay
        title='Cancel Airdrop'
        description='Are you sure you want to cancel this airdrop?'
        approveButton={{ text: `Yes (${String.fromCodePoint(0x21b5)})`, variant: 'danger', onClick: handleClose }}
        denyButton={{ text: 'No', onClick: toggleIsWarningOpen }}
      />

      <Modal isOpen={isUnfrackOpen} onClose={toggleIsUnfrackOpen}>
        <FlexColumn
          $gap={24}
          style={{
            padding: '24px',
            borderRadius: '32px',
            backgroundColor: theme.darkMode ? theme.colors.secondary : theme.colors.primary,
            alignItems: 'center',
          }}
        >
          <Image src='/assets/unfrack.svg' alt='' width={556.31} height={143.15} />

          <FlexRow>
            <Button variant='tertiary' onClick={() => window.open('https://unfrack.it', '_blank', 'noopener noreferrer')}>
              {'Unfrack.it'}
            </Button>

            <Button variant='tertiary' onClick={toggleIsUnfrackOpen}>
              {'Ignore'}
            </Button>
          </FlexRow>

          <Text color={theme.darkMode ? theme.colors.primary : theme.colors.secondary}>
            We recommend unfracking your wallet before running an airdrop.
          </Text>
        </FlexColumn>
      </Modal>
    </Fragment>
  )
}
