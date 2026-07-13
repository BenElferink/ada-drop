import React, { CSSProperties, type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { Divider } from '../divider';
import styled from 'styled-components';
import { getStatusIcon } from '@odigos/ui-kit/functions';
import { FadeLoader } from '../fade-loader';
import { StatusType, OtherStatus, type SVG } from '@odigos/ui-kit/types';

interface StatusProps {
  title?: string;
  subtitle?: string;
  status?: StatusType | OtherStatus.Loading;
  forceIcon?: SVG;
  withIcon?: boolean;
  withBorder?: boolean;
  withBackground?: boolean;
  width?: CSSProperties['width'];
  size?: number;
  family?: 'primary' | 'secondary';
}

const Container = styled.div<{
  $status: StatusType;
  $width?: StatusProps['width'];
  $size: number;
  $withIcon?: StatusProps['withIcon'];
  $withBorder?: StatusProps['withBorder'];
  $withBackground?: StatusProps['withBackground'];
}>`
  display: flex;
  align-items: center;
  gap: ${({ $size }) => $size / 3}px;
  padding: ${({ $size, $withBorder, $withBackground }) => ($withBorder || $withBackground ? `${$size / ($withBorder ? 3 : 2)}px ${$size / ($withBorder ? 1.5 : 1)}px` : '0')};
  width: ${({ $width }) => $width || 'fit-content'};
  border-radius: 360px;
  border: ${({ $withBorder, $status, theme }) => ($withBorder ? `1px solid ${theme.text[$status] + Theme.opacity.hex['050']}` : 'none')};
  background: ${({ $withBackground, $status, theme }) => ($withBackground ? `linear-gradient(90deg, transparent 0%, ${theme.text[$status] + Theme.opacity.hex['030']} 100%)` : 'transparent')};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TextWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TextNoWrap = styled(Text)`
  text-wrap: nowrap;
`;

const Status: FC<StatusProps> = ({ title, subtitle, status = StatusType.Default, forceIcon: ForceIcon, withIcon, withBorder, withBackground, width, size = 12, family = 'secondary' }) => {
  const theme = Theme.useTheme();

  const statusType = status === OtherStatus.Loading ? StatusType.Info : status;
  const StatusIcon = ForceIcon
    ? () => <ForceIcon size={size + 2} fill={theme.text[statusType]} />
    : status === OtherStatus.Loading
    ? () => <FadeLoader scale={0.8} />
    : () => getStatusIcon(statusType, theme)({ size: size + 2 });

  return (
    <Container $status={statusType} $width={width} $size={size} $withIcon={withIcon} $withBorder={withBorder} $withBackground={withBackground}>
      {withIcon && (
        <IconWrapper>
          <StatusIcon />
        </IconWrapper>
      )}

      {(!!title || !!subtitle) && (
        <TextWrapper>
          {!!title && (
            <TextNoWrap size={size} family={family} color={theme.text[statusType]}>
              {title}
            </TextNoWrap>
          )}

          {!!title && !!subtitle && <Divider orientation='vertical' length={`${size - 2}px`} type={statusType} />}

          {!!subtitle && (
            <TextNoWrap size={size - 2} family={family} color={theme.text[`${statusType}_secondary`]}>
              {subtitle}
            </TextNoWrap>
          )}
        </TextWrapper>
      )}
    </Container>
  );
};

export { Status, type StatusProps };
