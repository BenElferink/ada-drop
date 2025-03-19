import React, { type FC } from 'react'
import type { AirdropSettings } from '@/@types'
import { FlexColumn, Text } from '@odigos/ui-kit/components'

type Data = Pick<AirdropSettings, 'airdropMethod'>

interface HoldersJourneyProps {
  step: number
  defaultData: Data
  callback: (payload: Data) => void
}

export const HoldersJourney: FC<HoldersJourneyProps> = ({ step, defaultData }) => {
  return (
    <FlexColumn>
      <Text>
        {defaultData.airdropMethod}
        <br />
        Step: {step}
      </Text>
    </FlexColumn>
  )

  // return step === 2 ? (
  //   <TokenSelector
  //     onlyFungible
  //     withAda
  //     withAmount
  //     defaultData={{
  //       thumb: settings['thumb'],
  //       tokenId: settings['tokenId'],
  //       tokenName: settings['tokenName'],
  //       tokenAmount: settings['tokenAmount'],
  //     }}
  //     callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
  //     next={increment}
  //     back={decrement}
  //   />
  // ) : step === 3 ? (
  //   <HolderPolicies
  //     defaultData={{
  //       holderPolicies: settings['holderPolicies'],
  //     }}
  //     callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
  //     next={increment}
  //     back={decrement}
  //   />
  // ) : step === 4 ? (
  //   <StakePools
  //     defaultData={{
  //       withDelegators: settings['withDelegators'],
  //       stakePools: settings['stakePools'],
  //     }}
  //     callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
  //     next={increment}
  //     back={decrement}
  //   />
  // ) : step === 5 ? (
  //   <HolderBlacklist
  //     defaultData={{
  //       withBlacklist: settings['withBlacklist'],
  //       blacklistWallets: settings['blacklistWallets'],
  //       blacklistTokens: settings['blacklistTokens'],
  //       holderPolicies: settings['holderPolicies'],
  //     }}
  //     callback={(payload) => setSettings((prev) => ({ ...prev, ...payload }))}
  //     next={increment}
  //     back={decrement}
  //   />
  // ) : step === 6 ? (
  //   <AirdropSnapshot
  //     payoutHolders={payoutHolders}
  //     settings={settings as AirdropSettings}
  //     callback={(payload) => setPayoutHolders(payload)}
  //     next={increment}
  //     back={decrement}
  //   />
  // ) : step === 7 ? (
  //   <AirdropPayout
  //     payoutHolders={payoutHolders}
  //     settings={settings as AirdropSettings}
  //     // next={increment}
  //     back={decrement}
  //   />
  // ) : null
}
