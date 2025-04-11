import React, { useMemo, type FC } from 'react'
import styled from 'styled-components'
import Theme from '@odigos/ui-kit/theme'
import { StatusType } from '@odigos/ui-kit/types'
import { getStatusIcon } from '@odigos/ui-kit/functions'
import { Badge, FadeLoader, FlexRow, Text, Tooltip } from '@odigos/ui-kit/components'

export interface ProgressBarProps {
  label: string
  max: number
  current: number
}

const Container = styled.div`
  position: relative;
  width: 100%;
  padding: 12px 0px 16px 0px;
  gap: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Bar = styled.div<{ $percent: number; $isDone: boolean }>`
  position: absolute;
  bottom: -2px;
  left: 0;
  background-color: ${({ theme, $isDone }) => ($isDone ? theme.text.success : theme.colors.majestic_blue_soft)};
  border-radius: 32px;
  height: 4px;
  width: ${({ $percent }) => `${$percent}%`};
  transition: width 0.3s;
`

export const ProgressBar: FC<ProgressBarProps> = ({ label, max = 100, current = 0 }) => {
  const theme = Theme.useTheme()

  const isDone = current === max
  const percent = isDone ? 100 : Math.round((100 / max) * current)

  const Icon = useMemo(() => (isDone ? getStatusIcon(StatusType.Success, theme) : () => <FadeLoader />), [isDone, theme])

  if (!max) {
    return null
  }

  return (
    <Container>
      <FlexRow $gap={6}>
        <Icon />

        <Text size={14} color={theme.text.grey}>
          {label}
        </Text>

        {!isDone && (
          <Text size={12} color={theme.text.darker_grey}>
            ({max})
          </Text>
        )}

        <Tooltip text={`${current} / ${max}`}>
          <Badge label={`${percent}%`} />
        </Tooltip>
      </FlexRow>

      <Bar $percent={percent} $isDone={isDone} />
    </Container>
  )
}
