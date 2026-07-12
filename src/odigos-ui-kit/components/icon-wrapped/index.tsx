import React, { type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import styled from 'styled-components';
import { ImageErrorIcon } from '@odigos/ui-kit/icons';
import { StatusType, type SVG } from '@odigos/ui-kit/types';
import { ImageControlled } from '../image-controlled';

interface IconWrappedProps {
  icon?: SVG;
  src?: string;
  alt?: string;
  status?: StatusType;
  size?: number;
}

const Container = styled.div<{ $status: IconWrappedProps['status']; $size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 8px;
  background: ${({ $status, theme }) => {
    const clr = theme.colors[$status || 'dropdown_bg_2'];
    return `linear-gradient(180deg, ${clr} 0%, ${clr + Theme.opacity.hex['030']} 100%)`;
  }};
`;

const IconWrapped: FC<IconWrappedProps> = ({ icon: Icon, src = '', alt = '', status, size = 36 }) => {
  return (
    <Container $status={status} $size={size}>
      {src ? <ImageControlled src={src} alt={alt} size={size - 12} /> : !!Icon ? <Icon size={size - 12} /> : <ImageErrorIcon size={size - 12} />}
    </Container>
  );
};

export { IconWrapped, type IconWrappedProps };
