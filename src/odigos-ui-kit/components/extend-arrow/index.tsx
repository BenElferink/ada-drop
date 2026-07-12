import React, { type FC } from 'react';
import styled from 'styled-components';
import { ExtendArrowIcon } from '@odigos/ui-kit/icons';

interface ExtendArrowProps {
  extend: boolean;
  size?: number;
  align?: 'left' | 'right' | 'center';
}

const Container = styled.div<{ $align?: ExtendArrowProps['align'] }>`
  margin: ${({ $align }) => ($align === 'right' ? 'auto 6px auto auto' : $align === 'left' ? 'auto auto auto 6px' : 'auto')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExtendArrow: FC<ExtendArrowProps> = ({ extend, size = 14, align = 'center' }) => {
  return (
    <Container $align={align}>
      <ExtendArrowIcon size={size} rotate={extend ? 180 : 0} />
    </Container>
  );
};

export { ExtendArrow, type ExtendArrowProps };
