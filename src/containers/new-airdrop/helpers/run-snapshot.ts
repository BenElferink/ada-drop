import { type Dispatch, type SetStateAction } from 'react'
import api from '@/utils/api'
import cswap from '@/utils/cswap'
import { ADA } from '@/constants'
import knownWallets from '@/data/known-wallets.json'
import { chunk, eachLimit, formatTokenAmountFromChain, formatTokenAmountToChain } from '@/functions'
import type {
  AirdropSettings,
  Delegator,
  PayoutRecipient,
  PolicyId,
  PolicyInfo,
  PopulatedToken,
  RankedToken,
  SnapshotHolder,
  SnapshotProgressCounts,
  StakeKey,
  TokenOwners,
} from '@/@types'

// !! must handle catch outside
export const runSnapshot = async (
  stakeKey: StakeKey,
  settings: AirdropSettings,
  setProgress: Dispatch<SetStateAction<SnapshotProgressCounts>>
): Promise<PayoutRecipient[]> => {
  if (!settings) return []

  const { tokenAmount, policies, stakePools, blacklistWallets, blacklistTokens } = settings
  const knownWallet = knownWallets.find((w) => w.wallets.includes(stakeKey))

  const holders: SnapshotHolder[] = []
  const fetchedTokens: Record<string, PopulatedToken[]> = {}
  const fetchedRankedTokens: Record<string, PolicyInfo['tokens']> = {}
  const includedTokenCounts: Record<string, number> = {}

  if (
    !!knownWallet &&
    !!knownWallet.lpTokens &&
    !!knownWallet.lpTokens.cswap &&
    policies.find((p) => p.policyId === knownWallet.lpTokens?.forPolicyId)
  ) {
    const pId = knownWallet.lpTokens?.forPolicyId as PolicyId
    if (!includedTokenCounts[pId]) includedTokenCounts[pId] = 0

    const farmers = await cswap.getFarmers(knownWallet.lpTokens.cswap)

    // TODO: re-use this
    farmers.forEach(({ stakeAddress, walletAddress, tokensB }) => {
      const isBlacklisted = !!blacklistWallets.find((str) => str === stakeAddress)

      if (!isBlacklisted) {
        const humanAmount = Math.floor(tokensB)
        const holderItem = {
          tokenId: pId,
          isFungible: true,
          humanAmount,
        }

        const foundHolderIndex = holders.findIndex((item) => item.stakeKey === stakeAddress)

        if (foundHolderIndex === -1) {
          holders.push({
            stakeKey: stakeAddress,
            addresses: [walletAddress],
            assets: {
              [pId]: [holderItem],
            },
          })
        } else {
          if (!holders[foundHolderIndex].addresses.includes(walletAddress)) {
            holders[foundHolderIndex].addresses.push(walletAddress)
          }

          if (Array.isArray(holders[foundHolderIndex].assets[pId])) {
            holders[foundHolderIndex].assets[pId].push(holderItem)
          } else {
            holders[foundHolderIndex].assets[pId] = [holderItem]
          }
        }

        includedTokenCounts[pId] += humanAmount
      }
    })
  }

  for (let pIdx = 0; pIdx < policies.length; pIdx++) {
    const { policyId, withRanks } = policies[pIdx]
    if (!includedTokenCounts[policyId]) includedTokenCounts[policyId] = 0

    setProgress((prev) => ({
      ...prev,
      policy: { ...prev.policy, current: pIdx, max: policies.length },
    }))

    const { tokens: policyTokens } = await api.policy.getData(policyId, { allTokens: true, withRanks })

    if (withRanks) {
      if (fetchedRankedTokens[policyId]) {
        fetchedRankedTokens[policyId].push(...policyTokens)
      } else {
        fetchedRankedTokens[policyId] = policyTokens
      }
    }

    for (let tIdx = 0; tIdx < policyTokens.length; tIdx++) {
      const { tokenId, isFungible, tokenAmount } = policyTokens[tIdx]

      setProgress((prev) => ({
        ...prev,
        token: { ...prev.token, current: tIdx, max: policyTokens.length },
      }))

      if (tokenId !== policyId) {
        // token not burned & token not blacklisted
        if (tokenAmount.onChain !== 0 && !blacklistTokens.find((str) => str === tokenId)) {
          const fetchedToken = await api.token.getData(tokenId)
          const tokenOwners: TokenOwners['owners'] = []

          for (let page = 1; true; page++) {
            const fetched = await api.token.getOwners(tokenId, { page })

            if (isFungible)
              setProgress((prev) => ({
                ...prev,
                holder: { ...prev.holder, current: 0, max: (prev.holder?.max || 0) + fetched.owners.length },
              }))
            else
              setProgress((prev) => ({
                ...prev,
                holder: { ...prev.holder, current: 0, max: 0 },
              }))

            if (!fetched.owners.length) break
            tokenOwners.push(...fetched.owners)

            if (fetched.owners.length < 100) break
          }

          for (let oIdx = 0; oIdx < tokenOwners.length; oIdx++) {
            const { quantity, stakeKey, addresses } = tokenOwners[oIdx]
            const { address, isScript } = addresses[0]

            if (isFungible)
              setProgress((prev) => ({
                ...prev,
                holder: { ...prev.holder, current: oIdx, max: tokenOwners.length },
              }))

            const isOnCardano = address.indexOf('addr1') === 0
            const isBlacklisted = !!blacklistWallets.find((str) => str === stakeKey)

            if (isOnCardano && !!stakeKey && !isScript && !isBlacklisted) {
              if (fetchedTokens[policyId]) {
                fetchedTokens[policyId].push(fetchedToken)
              } else {
                fetchedTokens[policyId] = [fetchedToken]
              }

              // TODO: re-use this
              const humanAmount = formatTokenAmountFromChain(quantity, fetchedToken.tokenAmount.decimals)
              const holderItem = {
                tokenId,
                isFungible,
                humanAmount,
              }

              const foundHolderIndex = holders.findIndex((item) => item.stakeKey === stakeKey)

              if (foundHolderIndex === -1) {
                holders.push({
                  stakeKey,
                  addresses: [address],
                  assets: {
                    [policyId]: [holderItem],
                  },
                })
              } else {
                if (!holders[foundHolderIndex].addresses.includes(address)) {
                  holders[foundHolderIndex].addresses.push(address)
                }

                if (Array.isArray(holders[foundHolderIndex].assets[policyId])) {
                  holders[foundHolderIndex].assets[policyId].push(holderItem)
                } else {
                  holders[foundHolderIndex].assets[policyId] = [holderItem]
                }
              }

              includedTokenCounts[policyId] += humanAmount
            }
          }

          if (isFungible)
            setProgress((prev) => ({
              ...prev,
              holder: { ...prev.holder, current: tokenOwners.length, max: tokenOwners.length },
            }))
        }
      }
    }
    setProgress((prev) => ({
      ...prev,
      token: { ...prev.token, current: policyTokens.length, max: policyTokens.length },
    }))
  }
  setProgress((prev) => ({
    ...prev,
    policy: { ...prev.policy, current: policies.length, max: policies.length },
  }))

  const delegators: Delegator[] = []

  for (let sIdx = 0; sIdx < stakePools.length; sIdx++) {
    const poolId = stakePools[sIdx]

    setProgress((prev) => ({
      ...prev,
      pool: { ...prev.pool, current: sIdx, max: stakePools.length },
    }))

    let continueLoop = true
    const allFetched: Delegator[] = []
    for (let page = 1; continueLoop; page++) {
      const fetched = await api.stakePool.getDelegators(poolId, { page })

      setProgress((prev) => ({
        ...prev,
        delegator: { ...prev.delegator, current: prev.delegator?.current || 0, max: (prev.delegator?.max || 0) + fetched.delegators.length },
      }))

      allFetched.push(...fetched.delegators)
      if (!fetched.delegators.length) continueLoop = false
    }

    await eachLimit<typeof allFetched>(chunk<(typeof allFetched)[0]>(allFetched || [], 10), 10, async (items) => {
      for (let dIdx = 0; dIdx < items.length; dIdx++) {
        const { stakeKey, delegatedLovelaces } = items[dIdx]
        const isBlacklisted = !!blacklistWallets.find((str) => str === stakeKey)

        setProgress((prev) => ({
          ...prev,
          delegator: { ...prev.delegator, current: (prev.delegator?.current || 0) + 1, max: allFetched.length },
        }))

        if (!!delegatedLovelaces && !isBlacklisted) {
          const { addresses } = await api.wallet.getData(stakeKey)

          delegators.push({
            stakeKey,
            address: addresses[0].address,
            delegatedLovelaces,
          })
        }
      }
    })

    setProgress((prev) => ({
      ...prev,
      delegator: { ...prev.delegator, current: allFetched.length, max: allFetched.length },
    }))
  }

  setProgress((prev) => ({
    ...prev,
    pool: { ...prev.pool, current: stakePools.length, max: stakePools.length },
  }))

  let divider = 0

  if (policies.length) {
    Object.entries(includedTokenCounts).forEach(([policyId, count]) => {
      const policyWeight = policies.find((item) => item.policyId === policyId)?.weight || 0
      divider += count * policyWeight
    })
  } else if (stakePools.length) {
    for (const { delegatedLovelaces } of delegators) {
      divider += formatTokenAmountFromChain(delegatedLovelaces, ADA['DECIMALS'])
    }
  }

  let sharePerToken = tokenAmount?.onChain / divider
  if (sharePerToken == Infinity || sharePerToken == null || isNaN(sharePerToken)) sharePerToken = 0

  const payoutWallets = (
    policies.length
      ? holders.map(({ stakeKey, addresses, assets }) => {
          let amountForAssets = 0
          let amountForTraits = 0
          let amountForRanks = 0
          let amountForWhale = 0

          Object.entries(assets).forEach(([heldPolicyId, heldPolicyAssets]) => {
            const policySetting = settings.policies.find((item) => item.policyId === heldPolicyId)
            const policyWeight = policySetting?.weight || 0
            let totalHumanAmountHeld = 0

            for (const { tokenId, isFungible, humanAmount } of heldPolicyAssets) {
              amountForAssets += humanAmount * sharePerToken * policyWeight
              if (!isFungible) totalHumanAmountHeld += humanAmount

              if (!isFungible && policySetting?.withTraits && !!policySetting.traitOptions?.length) {
                const asset = fetchedTokens[heldPolicyId].find((asset) => asset.tokenId === tokenId) as PopulatedToken
                const attributes: PopulatedToken['attributes'] = asset.attributes

                policySetting.traitOptions.forEach(({ category, trait, amount }) => {
                  if (attributes[category.toLowerCase()]?.toLowerCase() === trait.toLowerCase()) {
                    // calc here because it's not calculated at the time of input
                    // only token selection amount is calculated at the time of input
                    const onChainAmountConvertedWithDecimals = formatTokenAmountToChain(amount, settings.tokenAmount.decimals)
                    amountForTraits += onChainAmountConvertedWithDecimals
                  }
                })
              }

              if (!isFungible && policySetting?.withRanks && !!policySetting.rankOptions?.length) {
                const asset = fetchedRankedTokens[heldPolicyId].find((asset) => asset.tokenId === tokenId) as RankedToken

                policySetting.rankOptions.forEach(({ minRange, maxRange, amount }) => {
                  if (asset?.rarityRank && asset.rarityRank >= minRange && asset.rarityRank <= maxRange) {
                    // calc here because it's not calculated at the time of input
                    // only token selection amount is calculated at the time of input
                    const onChainAmountConvertedWithDecimals = formatTokenAmountToChain(amount, settings.tokenAmount.decimals)
                    amountForRanks += onChainAmountConvertedWithDecimals
                  }
                })
              }
            }

            if (policySetting?.withWhales && !!policySetting.whaleOptions?.length) {
              policySetting.whaleOptions
                .sort((a, b) => b.groupSize - a.groupSize)
                .forEach(({ shouldStack, groupSize, amount }) => {
                  // must be sorted by biggest group first, so the !amountForWhale rule is valid
                  if (!amountForWhale && totalHumanAmountHeld >= groupSize) {
                    // calc here because it's not calculated at the time of input
                    // only token selection amount is calculated at the time of input
                    const onChainAmountConvertedWithDecimals = formatTokenAmountToChain(amount, settings.tokenAmount.decimals)
                    amountForWhale += shouldStack
                      ? Math.floor(totalHumanAmountHeld / groupSize) * onChainAmountConvertedWithDecimals
                      : onChainAmountConvertedWithDecimals
                  }
                })
            }
          })

          const payout = Math.floor(amountForAssets + amountForTraits + amountForRanks + amountForWhale)

          return {
            stakeKey,
            address: addresses[0],
            payout,
            txHash: '',
          }
        })
      : stakePools.length
      ? delegators.map(({ stakeKey, address, delegatedLovelaces }) => {
          const amountForStake = formatTokenAmountFromChain(delegatedLovelaces, ADA['DECIMALS']) * sharePerToken
          const payout = Math.floor(amountForStake)

          return {
            stakeKey,
            address: address as string,
            payout,
            txHash: '',
          }
        })
      : []
  )
    .filter(({ payout }) => !!payout)
    .sort((a, b) => b.payout - a.payout)

  return payoutWallets
}
