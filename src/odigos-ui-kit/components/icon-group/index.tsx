import React, { type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import type { SVG } from '@odigos/ui-kit/types';
import { StatusType } from '@odigos/ui-kit/types';
import styled from 'styled-components';
import { IconWrapped } from '../icon-wrapped';
import { ImageControlled } from '../image-controlled';

interface IconGroupProps {
  icons?: SVG[];
  iconSrcs?: string[];
  status?: StatusType;
  size?: number;
  id: string;
}

const Container = styled.div<{ $status: IconGroupProps['status']; $size: number }>`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

const IconWrapper = styled.div<{ $status: IconGroupProps['status']; $size: number; $top: number; $left: number; $zIndex: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  z-index: ${({ $zIndex }) => $zIndex};
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 100%;
  border: 1px solid ${({ theme, $status }) => ($status ? theme.text[$status] : theme.colors.border) + Theme.opacity.hex['030']};
  background: ${({ $status, theme }) => {
    const clr = theme.colors[$status || 'dropdown_bg_2'];
    return `linear-gradient(180deg, ${clr} 0%, ${clr + Theme.opacity.hex['030']} 100%)`;
  }};
`;

const IconGroup: FC<IconGroupProps> = ({ icons = [], iconSrcs = [], status, size = 36, id }) => {
  const theme = Theme.useTheme();

  const SINGLE_ICON_PADDING = 12;
  const MULTI_ICON_SCALE_DIVIDER = 2.7;
  const imgSize = icons.length === 1 || iconSrcs.length === 1 ? size - SINGLE_ICON_PADDING : size / MULTI_ICON_SCALE_DIVIDER;

  if (iconSrcs.length > 0) {
    return <IconGroup icons={iconSrcs.map((src) => (() => <ImageControlled src={src} size={imgSize} />) as unknown as SVG)} status={status} size={size} id={id} />;
  }

  if (icons.length === 1) {
    return <IconWrapped icon={icons[0]} status={status} size={size} />;
  }

  const getTopPosition = (idx: number) => {
    // The multiplications are magic numbers chosen based on the divider of the image size (currently 2.7)
    if (icons.length <= 2) return imgSize * 0.5;
    if (idx === 0 || idx === 1) return 0;
    return imgSize * 1.15;
  };

  const getLeftPosition = (idx: number) => {
    // The multiplications are magic numbers chosen based on the divider of the image size (currently 2.7)
    if (idx === 0) return 0;
    if (idx === 1) return imgSize * 1.15;
    return imgSize * 1.15 * 0.5;
  };

  return (
    <Container $status={status} $size={size}>
      {icons.map((Icon, idx) => {
        if (idx > 2) return null;

        return (
          <IconWrapper key={`icon-${id}-${idx}`} $status={status} $size={imgSize * 1.5} $top={getTopPosition(idx)} $left={getLeftPosition(idx)} $zIndex={idx + 1}>
            {idx === 2 && icons.length > 3 ? (
              <Text family='secondary' color={theme.text.dark_grey} size={imgSize * 0.8}>
                +{icons.length - 2}
              </Text>
            ) : (
              <Icon size={imgSize} />
            )}
          </IconWrapper>
        );
      })}
    </Container>
  );
};

export { IconGroup, type IconGroupProps };
