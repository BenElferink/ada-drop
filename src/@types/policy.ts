import type { PolicyId } from './common'
import type { BaseToken, RankedToken } from './token'

export interface PolicyInfo {
  policyId: PolicyId
  tokens: BaseToken[] | RankedToken[]
}
