import React, { memo, type FC } from 'react'
import styled from 'styled-components'
import { EDGE_TYPES } from '@/@types'
import { EdgeLabelRenderer, BaseEdge, type EdgeProps, type Edge, getSmoothStepPath } from '@xyflow/react'

type LabeledEdgeProps = EdgeProps<
  Edge<
    {
      label: string
      isMultiTarget?: boolean
      isError?: boolean
    },
    EDGE_TYPES.LABELED
  >
>

const Label = styled.div<{ $labelX: number; $labelY: number; $isError?: boolean }>`
  position: absolute;
  transform: ${({ $labelX, $labelY }) => `translate(-50%, -50%) translate(${$labelX}px, ${$labelY}px)`};
  width: 75px;
  padding: 2px 6px;
  background-color: ${({ theme }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (theme as any).colors.primary};
  border-radius: 360px;
  border: 1px solid
    ${({ $isError, theme }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $isError ? (theme as any).colors.dark_red : (theme as any).colors.border};
  color: ${({ $isError, theme }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $isError ? (theme as any).text.error : (theme as any).text.light_grey};
  font-family: ${({ theme }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (theme as any).font_family.secondary};
  font-size: 10px;
  font-weight: 400;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
`

const LabeledEdge: FC<LabeledEdgeProps> = memo(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style }) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <EdgeLabelRenderer>
        <Label
          $labelX={data?.isMultiTarget ? targetX - 50 : sourceX + 50}
          $labelY={data?.isMultiTarget ? targetY : sourceY}
          $isError={data?.isError}
          className='nodrag nopan'
        >
          {data?.label}
        </Label>
      </EdgeLabelRenderer>
    </>
  )
})

LabeledEdge.displayName = 'LabeledEdge'
export default LabeledEdge
