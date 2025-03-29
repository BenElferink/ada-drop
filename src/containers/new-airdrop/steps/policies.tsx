import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/utils/api'
import Theme from '@odigos/ui-kit/theme'
import { deepClone } from '@odigos/ui-kit/functions'
import { PlusIcon, TrashIcon } from '@odigos/ui-kit/icons'
import { INIT_POLICY_SETTINGS, INIT_RANK_POINTS, INIT_TRAIT_POINTS, INIT_WHALE_POINTS } from '@/constants'
import type { FormRef, PolicyRankOptions, PolicySettings, PolicyTraitOptions, PolicyWhaleOptions } from '@/@types'
import {
  Button,
  CenterThis,
  Checkbox,
  Divider,
  FadeLoader,
  FlexColumn,
  FlexRow,
  IconButton,
  Input,
  NotificationNote,
  SectionTitle,
  Text,
  Toggle,
} from '@odigos/ui-kit/components'
import { StatusType } from '@odigos/ui-kit/types'

type Data = PolicySettings

interface PoliciesProps {
  defaultData: Data
}

export const Policies = forwardRef<FormRef<Data>, PoliciesProps>(({ defaultData }, ref) => {
  const theme = Theme.useTheme()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({ message: '' })
  const [data, setData] = useState({
    ...deepClone(defaultData),
    policies: defaultData['policies'].length ? defaultData['policies'] : [deepClone(INIT_POLICY_SETTINGS)],
  })

  const nonEmpties = useMemo(() => data.policies.filter(({ policyId }) => !!policyId), [data.policies])

  useImperativeHandle(ref, () => ({
    getData: () => ({
      ...data,
      policies: nonEmpties.map((obj) => {
        let traitOptions: PolicyTraitOptions[] = []
        if (obj.withTraits && obj.traitOptions) {
          traitOptions = obj.traitOptions.filter((obj) => !!obj.category && !!obj.trait && !!obj.amount)
        }

        let rankOptions: PolicyRankOptions[] = []
        if (obj.withRanks && obj.rankOptions) {
          rankOptions = obj.rankOptions.filter((obj) => !!obj.minRange && !!obj.maxRange && !!obj.amount)
        }

        let whaleOptions: PolicyWhaleOptions[] = []
        if (obj.withWhales && obj.whaleOptions) {
          whaleOptions = obj.whaleOptions.filter((obj) => !!obj.groupSize && !!obj.amount)
        }

        return {
          ...obj,
          withTraits: !!traitOptions.length,
          traitOptions,
          withRanks: !!rankOptions.length,
          rankOptions,
          withWhales: !!whaleOptions.length,
          whaleOptions,
        }
      }),
    }),
    validate: async () => {
      if (!nonEmpties.length) {
        setErrors({ message: 'Missing required fields' })
        return false
      }

      setIsLoading(true)
      // setErrors({ message: '' })

      let isOk = true
      for await (const { policyId } of nonEmpties) {
        try {
          await api.policy.getData(policyId)
          setErrors((prev) => ({ ...prev, [policyId]: '' }))
        } catch (error) {
          console.error(error)
          isOk = false
          setErrors((prev) => ({ ...prev, message: 'Invalid Policy IDs', [policyId]: 'Invalid Policy ID' }))
        }
      }

      setIsLoading(false)
      return isOk
    },
  }))

  if (isLoading) {
    return (
      <CenterThis $gap={12}>
        <FadeLoader scale={1.2} />
        <Text>Verifying Data...</Text>
      </CenterThis>
    )
  }

  return (
    <>
      <SectionTitle title='Policy IDs' description='Enter the Policy IDs of the NFTs/Tokens you wish to airdrop to their holders.' />
      {!!errors.message && (
        <div style={{ width: '100%' }}>
          <NotificationNote type={StatusType.Error} title={errors.message} />
        </div>
      )}
      <Divider />

      {data.policies?.map(({ policyId, weight, withTraits, traitOptions, withRanks, rankOptions, withWhales, whaleOptions }, policyIdx) => (
        <FlexColumn key={`policy-${policyIdx}-${data.policies.length}`} $gap={24}>
          <FlexRow $gap={12} style={{ alignItems: 'flex-end' }}>
            <Input
              title='Policy ID'
              required
              errorMessage={errors[policyId] || errors.message}
              value={policyId}
              onChange={(e) => {
                const v = e.target.value

                setData((prev) => {
                  const payload = deepClone(prev)
                  payload.policies[policyIdx] = {
                    ...payload.policies[policyIdx],
                    policyId: v,
                  }
                  return payload
                })
                setErrors((prev) => ({ ...prev, message: '' }))
              }}
              style={{ width: '455px' }}
            />

            <div style={{ marginBottom: errors[policyId] || errors.message ? '18px' : '0' }}>
              <Input
                title='Weight'
                tooltip='The multiplier of this Policy ID (e.g. give Pass/Key/Card holders 2x more than PFP holders).'
                required
                disabled={!policyId}
                value={weight}
                onChange={(e) => {
                  const v = e.target.value
                  const n = Number(v)
                  if (isNaN(n) || n < 0) return

                  setData((prev) => {
                    const payload: PolicySettings = deepClone(prev)
                    payload.policies[policyIdx] = {
                      ...payload.policies[policyIdx],
                      weight: n,
                    }
                    return payload
                  })
                }}
                style={{ width: '100px' }}
              />
            </div>

            <div style={{ marginBottom: errors[policyId] || errors.message ? '18px' : '0' }}>
              <IconButton
                onClick={() => {
                  setData((prev) => {
                    const payload = deepClone(prev)
                    if (data.policies.length > 1) payload.policies.splice(policyIdx, 1)
                    else payload.policies[0] = deepClone(INIT_POLICY_SETTINGS)
                    return payload
                  })
                }}
              >
                <TrashIcon />
              </IconButton>
            </div>
          </FlexRow>

          <FlexColumn $gap={24}>
            <FlexColumn $gap={12}>
              <Toggle
                title='Trait Points'
                tooltip='Applies only to NFTs. Additional to the base weight!'
                disabled={!policyId}
                initialValue={withTraits}
                onChange={(bool) =>
                  setData((prev) => {
                    const payload = deepClone(prev)
                    payload.policies[policyIdx] = {
                      ...payload.policies[policyIdx],
                      withTraits: bool,
                      traitOptions: bool ? [deepClone(INIT_TRAIT_POINTS)] : [],
                    }
                    return payload
                  })
                }
              />

              {withTraits &&
                traitOptions?.map(({ category, trait, amount }, rewardingTraitsIdx) => (
                  <FlexRow
                    key={`policy-${policyIdx}-${data.policies.length}-trait-${rewardingTraitsIdx}-${traitOptions.length}`}
                    $gap={12}
                    style={{ alignItems: 'flex-end' }}
                  >
                    <Input
                      title='Category'
                      placeholder='e.g. Eyewear'
                      required
                      disabled={!withTraits}
                      value={category || ''}
                      onChange={(e) => {
                        const v = e.target.value

                        setData((prev) => {
                          const payload = deepClone<PolicySettings>(prev)
                          const arr = deepClone<PolicyTraitOptions[]>(payload.policies[policyIdx].traitOptions || [])

                          arr[rewardingTraitsIdx].category = v
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            traitOptions: arr,
                          }

                          return payload
                        })
                      }}
                    />

                    <Input
                      title='Value'
                      placeholder='e.g. 3D Glasses'
                      required
                      disabled={!withTraits}
                      value={trait || ''}
                      onChange={(e) => {
                        const v = e.target.value

                        setData((prev) => {
                          const payload: PolicySettings = deepClone(prev)
                          const arr = deepClone<PolicyTraitOptions[]>(payload.policies[policyIdx].traitOptions || [])

                          arr[rewardingTraitsIdx].trait = v
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            traitOptions: arr,
                          }

                          return payload
                        })
                      }}
                    />

                    <Input
                      title='Points'
                      placeholder='e.g. 5'
                      required
                      disabled={!withTraits}
                      value={amount || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        const n = Number(v)
                        if (isNaN(n) || n < 0) return

                        setData((prev) => {
                          const payload: PolicySettings = deepClone(prev)
                          const arr = deepClone<PolicyTraitOptions[]>(payload.policies[policyIdx].traitOptions || [])

                          arr[rewardingTraitsIdx].amount = n
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            traitOptions: arr,
                          }

                          return payload
                        })
                      }}
                    />

                    <div>
                      <IconButton
                        onClick={() =>
                          setData((prev) => {
                            const payload = deepClone<PolicySettings>(prev)
                            payload.policies[policyIdx].traitOptions?.push(deepClone(INIT_TRAIT_POINTS))
                            return payload
                          })
                        }
                      >
                        <PlusIcon />
                      </IconButton>
                    </div>

                    <div>
                      <IconButton
                        onClick={() => {
                          setData((prev) => {
                            const payload = deepClone(prev)
                            const arr = deepClone<PolicyTraitOptions[]>(payload.policies[policyIdx].traitOptions || [])

                            if (arr.length > 1) {
                              arr.splice(rewardingTraitsIdx, 1)
                              payload.policies[policyIdx] = {
                                ...payload.policies[policyIdx],
                                traitOptions: arr,
                              }
                            } else {
                              payload.policies[policyIdx] = {
                                ...payload.policies[policyIdx],
                                traitOptions: [deepClone(INIT_TRAIT_POINTS)],
                              }
                            }
                            return payload
                          })
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </FlexRow>
                ))}
            </FlexColumn>

            <FlexColumn $gap={12}>
              <FlexColumn $gap={2}>
                <Toggle
                  title='Rank Points'
                  tooltip='Applies only to NFTs. Additional to the base weight!'
                  disabled={!policyId}
                  initialValue={withRanks}
                  onChange={(bool) =>
                    setData((prev) => {
                      const payload = deepClone(prev)
                      payload.policies[policyIdx] = {
                        ...payload.policies[policyIdx],
                        withRanks: bool,
                        rankOptions: bool ? [deepClone(INIT_RANK_POINTS)] : [],
                      }
                      return payload
                    })
                  }
                />

                <FlexRow style={{ opacity: !policyId ? 0.5 : 1 }}>
                  <Text size={12} color={theme.text.info}>
                    Ranks are obtained from
                  </Text>
                  <Image src='/assets/cnfttools.png' alt='' width={12} height={12} priority unoptimized />
                  <Link href='https://cnft.tools' target='_blank' rel='noopener noreferrer'>
                    <Text color={theme.text.default} size={12} style={{ display: 'inline' }}>
                      cnft.tools
                    </Text>
                  </Link>
                </FlexRow>
              </FlexColumn>

              {withRanks &&
                rankOptions?.map(({ minRange, maxRange, amount }, rewardingRanksIdx) => (
                  <FlexRow
                    key={`policy-${policyIdx}-${data.policies.length}-rank-${rewardingRanksIdx}-${rankOptions.length}`}
                    $gap={12}
                    style={{ alignItems: 'flex-end' }}
                  >
                    <Input
                      title='Min. Range'
                      placeholder='e.g. 1'
                      required
                      disabled={!withRanks}
                      value={minRange || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        const n = Number(v)
                        if (isNaN(n) || n < 0) return

                        setData((prev) => {
                          const payload = deepClone<PolicySettings>(prev)
                          const arr = deepClone<PolicyRankOptions[]>(prev.policies[policyIdx].rankOptions || [])

                          arr[rewardingRanksIdx].minRange = n
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            rankOptions: arr,
                          }

                          return payload
                        })
                      }}
                    />

                    <Input
                      title='Max. Range'
                      placeholder='e.g. 1000'
                      required
                      disabled={!withRanks}
                      value={maxRange || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        const n = Number(v)
                        if (isNaN(n) || n < 0) return

                        setData((prev) => {
                          const payload = deepClone<PolicySettings>(prev)
                          const arr = deepClone<PolicyRankOptions[]>(prev.policies[policyIdx].rankOptions || [])

                          arr[rewardingRanksIdx].maxRange = n
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            rankOptions: arr,
                          }

                          return payload
                        })
                      }}
                    />

                    <Input
                      title='Points'
                      placeholder='e.g. 5'
                      required
                      disabled={!withRanks}
                      value={amount || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        const n = Number(v)
                        if (isNaN(n) || n < 0) return

                        setData((prev) => {
                          const payload = deepClone<PolicySettings>(prev)
                          const arr = deepClone<PolicyRankOptions[]>(prev.policies[policyIdx].rankOptions || [])

                          arr[rewardingRanksIdx].amount = n
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            rankOptions: arr,
                          }

                          return payload
                        })
                      }}
                    />

                    <div>
                      <IconButton
                        onClick={() =>
                          setData((prev) => {
                            const payload = deepClone<PolicySettings>(prev)
                            payload.policies[policyIdx].rankOptions?.push(deepClone(INIT_RANK_POINTS))
                            return payload
                          })
                        }
                      >
                        <PlusIcon />
                      </IconButton>
                    </div>

                    <div>
                      <IconButton
                        onClick={() => {
                          setData((prev) => {
                            const payload = deepClone(prev)
                            const arr = deepClone<PolicyRankOptions[]>(prev.policies[policyIdx].rankOptions || [])

                            if (arr.length > 1) {
                              arr.splice(rewardingRanksIdx, 1)
                              payload.policies[policyIdx] = {
                                ...payload.policies[policyIdx],
                                rankOptions: arr,
                              }
                            } else {
                              payload.policies[policyIdx] = {
                                ...payload.policies[policyIdx],
                                rankOptions: [deepClone(INIT_RANK_POINTS)],
                              }
                            }
                            return payload
                          })
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </FlexRow>
                ))}
            </FlexColumn>

            <FlexColumn $gap={12}>
              <Toggle
                title='Whale Points'
                tooltip='Applies only to NFTs. Additional to the base weight!'
                disabled={!policyId}
                initialValue={withWhales}
                onChange={(bool) =>
                  setData((prev) => {
                    const payload = deepClone(prev)
                    payload.policies[policyIdx] = {
                      ...payload.policies[policyIdx],
                      withWhales: bool,
                      whaleOptions: bool ? [deepClone(INIT_WHALE_POINTS)] : [],
                    }
                    return payload
                  })
                }
              />

              {withWhales &&
                whaleOptions?.map(({ shouldStack, groupSize, amount }, rewardingWhalesIdx) => (
                  <FlexRow
                    key={`policy-${policyIdx}-${data.policies.length}-whale-${rewardingWhalesIdx}-${whaleOptions.length}`}
                    $gap={12}
                    style={{ alignItems: 'flex-end' }}
                  >
                    <Input
                      title='Group Size'
                      placeholder='e.g. 50+'
                      required
                      disabled={!withWhales}
                      value={groupSize || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        const n = Number(v)
                        if (isNaN(n) || n < 0) return

                        setData((prev) => {
                          const payload = deepClone<PolicySettings>(prev)
                          const arr = deepClone<PolicyWhaleOptions[]>(prev.policies[policyIdx].whaleOptions || [])

                          arr[rewardingWhalesIdx].groupSize = n
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            whaleOptions: arr,
                          }

                          return payload
                        })
                      }}
                      style={{ width: '198px' }}
                    />

                    <Input
                      title='Points'
                      placeholder='e.g. 5'
                      required
                      disabled={!withWhales}
                      value={amount || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        const n = Number(v)
                        if (isNaN(n) || n < 0) return

                        setData((prev) => {
                          const payload = deepClone<PolicySettings>(prev)
                          const arr = deepClone<PolicyWhaleOptions[]>(prev.policies[policyIdx].whaleOptions || [])

                          arr[rewardingWhalesIdx].amount = n
                          payload.policies[policyIdx] = {
                            ...payload.policies[policyIdx],
                            whaleOptions: arr,
                          }

                          return payload
                        })
                      }}
                      style={{ width: '198px' }}
                    />

                    <FlexRow style={{ padding: '8px 0' }}>
                      <Checkbox
                        title='Stackable'
                        disabled={!withWhales}
                        value={shouldStack}
                        onChange={(bool) =>
                          setData((prev) => {
                            const payload = deepClone<PolicySettings>(prev)
                            const arr = deepClone<PolicyWhaleOptions[]>(prev.policies[policyIdx].whaleOptions || [])

                            arr[rewardingWhalesIdx].shouldStack = bool
                            payload.policies[policyIdx] = {
                              ...payload.policies[policyIdx],
                              whaleOptions: arr,
                            }

                            return payload
                          })
                        }
                        style={{ width: '100px' }}
                      />
                    </FlexRow>

                    <div style={{ marginLeft: 'auto' }}>
                      <IconButton
                        onClick={() =>
                          setData((prev) => {
                            const payload = deepClone<PolicySettings>(prev)
                            payload.policies[policyIdx].whaleOptions?.push(deepClone(INIT_WHALE_POINTS))
                            return payload
                          })
                        }
                      >
                        <PlusIcon />
                      </IconButton>
                    </div>

                    <div>
                      <IconButton
                        onClick={() => {
                          setData((prev) => {
                            const payload = deepClone(prev)
                            const arr = deepClone<PolicyWhaleOptions[]>(payload.policies[policyIdx].whaleOptions || [])

                            if (arr.length > 1) {
                              arr.splice(rewardingWhalesIdx, 1)
                              payload.policies[policyIdx] = {
                                ...payload.policies[policyIdx],
                                whaleOptions: arr,
                              }
                            } else {
                              payload.policies[policyIdx] = {
                                ...payload.policies[policyIdx],
                                whaleOptions: [deepClone(INIT_WHALE_POINTS)],
                              }
                            }
                            return payload
                          })
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </FlexRow>
                ))}
            </FlexColumn>
          </FlexColumn>

          <Divider />
        </FlexColumn>
      ))}

      <Button
        variant='primary'
        disabled={!nonEmpties.length}
        onClick={() =>
          setData((prev) => {
            const payload = deepClone<PolicySettings>(prev)
            payload.policies.push(deepClone(INIT_POLICY_SETTINGS))
            return payload
          })
        }
      >
        <PlusIcon fill={!nonEmpties.length ? theme.text.secondary : theme.text.primary} size={20} />
        Add another Policy ID
      </Button>
    </>
  )
})

Policies.displayName = Policies.name
