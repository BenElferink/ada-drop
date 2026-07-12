import React, { type FC, useState } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { Tooltip } from '../tooltip';
import { StatusType } from '@odigos/ui-kit/types';
import { isEmpty } from '@odigos/ui-kit/functions';
import styled from 'styled-components';
import { ColumnCell, RowCell } from '.';
import { useContainerSize } from '@odigos/ui-kit/hooks';
import { IconWrapped } from '../icon-wrapped';

interface TableRowProps {
  index: number;
  columns: ColumnCell[];
  cells: RowCell[];
  onClick?: () => void;
  status?: StatusType;
  faded?: boolean;
}

const Tr = styled.tr<{ $withHover: boolean; $faded?: boolean }>`
  cursor: ${({ $withHover }) => ($withHover ? 'pointer' : 'default')};
  opacity: ${({ $faded }) => ($faded ? 0.5 : 1)};
`;

const Td = styled.td<{ $isFirst: boolean }>`
  position: relative;
  width: fit-content;
  padding: 16px 8px 16px ${({ $isFirst }) => ($isFirst ? '16px' : '8px')};
  color: ${({ theme }) => theme.text.secondary};
  font-family: ${({ theme }) => theme.font_family.primary};
  font-size: 14px;
  white-space: nowrap;
`;

const RowText = styled(Text)<{ $color: RowCell['textColor'] }>`
  font-size: 14px;
  color: ${({ $color, theme }) => $color ?? theme.text.secondary};
  line-height: 16px;

  overflow: hidden;
  overflow-wrap: break-word;
  white-space: wrap;
  text-wrap: wrap;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const RowBackground = styled.div<{ $height: number; $width: number; $top: number; $hovered: boolean; $status?: StatusType }>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  border-radius: 16px;
  background-color: ${({ theme, $hovered, $status }) =>
    $hovered
      ? !!$status
        ? theme.text[$status] + Theme.opacity.hex['020']
        : theme.colors.majestic_blue + Theme.opacity.hex['030']
      : !!$status
      ? theme.text[$status] + Theme.opacity.hex['010']
      : theme.colors.secondary + Theme.opacity.hex['005']};
`;

const TableRow: FC<TableRowProps> = ({ index, columns, cells, onClick, status, faded }) => {
  const { containerRef, containerHeight, containerWidth } = useContainerSize();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tr
      // @ts-ignore
      ref={containerRef}
      onMouseEnter={() => !!onClick && setIsHovered(true)}
      onMouseLeave={() => !!onClick && setIsHovered(false)}
      onClick={() => !!onClick && onClick()}
      $withHover={!!onClick}
      $faded={faded}
    >
      {columns.map(({ key }, i) => {
        const rowCell = cells.find(({ columnKey }) => columnKey === key);
        if (!rowCell) return null;
        const { value, textColor, withTooltip, icon, component: Component } = rowCell;

        return (
          <Td key={`table-row-${key}-${value}-${index}-${i}`} $isFirst={i === 0}>
            {!!icon ? (
              <IconWrapped icon={icon} />
            ) : !!Component ? (
              <Component />
            ) : (
              <Tooltip text={withTooltip && !!value ? String(value) : ''}>
                <RowText $color={textColor}>{!isEmpty(value) ? value : '-'}</RowText>
              </Tooltip>
            )}

            {i === 0 && <RowBackground $height={containerHeight} $width={containerWidth} $top={containerHeight * index} $hovered={isHovered} $status={status} />}
          </Td>
        );
      })}
    </Tr>
  );
};

export { TableRow, type TableRowProps };
