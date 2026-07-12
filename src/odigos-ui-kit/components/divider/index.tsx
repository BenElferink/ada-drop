import React, { type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import styled from 'styled-components';
import { StatusType } from '@odigos/ui-kit/types';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  type?: StatusType; // this is to apply coloring to the divider
  thickness?: number;
  length?: string;
  margin?: string;
}

const StyledDivider = styled.div<{
  $orientation?: DividerProps['orientation'];
  $type?: DividerProps['type'];
  $thickness?: DividerProps['thickness'];
  $length?: DividerProps['length'];
  $margin?: DividerProps['margin'];
}>`
  width: ${({ $orientation, $thickness, $length }) => ($orientation === 'vertical' ? `${$thickness}px` : $length || '100%')};
  height: ${({ $orientation, $thickness, $length }) => ($orientation === 'horizontal' ? `${$thickness}px` : $length || '100%')};
  margin: ${({ $orientation, $margin }) => $margin || ($orientation === 'horizontal' ? '8px 0' : '0 8px')};
  background-color: ${({ $type, theme }) => (!!$type ? theme.text[$type] : theme.colors.border) + Theme.opacity.hex['050']};
`;

const Divider: FC<DividerProps> = ({ orientation = 'horizontal', type, thickness = 1, length, margin }) => {
  return <StyledDivider $orientation={orientation} $type={type} $thickness={thickness} $length={length} $margin={margin} />;
};

export { Divider, type DividerProps };
