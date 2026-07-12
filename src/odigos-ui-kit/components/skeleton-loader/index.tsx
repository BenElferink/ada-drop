import React, { type CSSProperties, type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import styled from 'styled-components';
import { FlexColumn } from '@odigos/ui-kit/components/styled';

interface SkeletonLoaderProps {
  maxWidth?: CSSProperties['maxWidth'];
  size?: number;
}

const Container = styled.div<{ $maxWidth: SkeletonLoaderProps['maxWidth'] }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth};`}
`;

const SkeletonItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Thumbnail = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: ${({ theme }) => `linear-gradient(90deg, ${theme.colors.dropdown_bg_2} 25%, ${theme.colors.dropdown_bg_2} 50%, ${theme.colors.border} 75%)`};
  background-size: 200% 100%;
  animation: ${Theme.animations.shimmer} 10s infinite linear;
`;

const LineWrapper = styled(FlexColumn)`
  flex: 1;
  gap: 12px;
`;

const Line = styled.div<{ $width: string }>`
  width: ${({ $width }) => $width};
  height: 16px;
  background: ${({ theme }) => `linear-gradient(90deg, ${theme.colors.dropdown_bg_2} 25%, ${theme.colors.dropdown_bg_2} 50%, ${theme.colors.border} 75%)`};
  background-size: 200% 100%;
  animation: ${Theme.animations.shimmer} 1.5s infinite linear;
  border-radius: 4px;
`;

const SkeletonLoader: FC<SkeletonLoaderProps> = ({ size = 5, maxWidth }) => {
  return (
    <Container $maxWidth={maxWidth}>
      {[...Array(size)].map((_, index) => (
        <SkeletonItem key={index}>
          <Thumbnail />
          <LineWrapper>
            <Line $width='80%' />
            <Line $width='100%' />
          </LineWrapper>
        </SkeletonItem>
      ))}
    </Container>
  );
};

export { SkeletonLoader, type SkeletonLoaderProps };
