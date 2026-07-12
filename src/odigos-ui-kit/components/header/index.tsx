import React, { type FC, Fragment, type ReactNode } from 'react';
import Theme from '@odigos/ui-kit/theme';
import styled from 'styled-components';
import { FlexRow } from '@odigos/ui-kit/components/styled';

interface HeaderProps {
  left?: ReactNode[];
  center?: ReactNode[];
  right?: ReactNode[];
}

const Container = styled(FlexRow)`
  position: relative;
  width: calc(100% - 24px);
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.dark_grey};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border + Theme.opacity.hex['050']};
`;

const AlignLeft = styled(FlexRow)`
  margin-right: auto;
  margin-left: 32px;
  gap: 12px;
`;

const AlignRight = styled(FlexRow)`
  margin-left: auto;
  margin-right: 32px;
  gap: 12px;
`;

const PositionCenter = styled(FlexRow)`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  gap: 12px;
`;

const Header: FC<HeaderProps> = ({ left = [], center = [], right = [] }) => {
  return (
    <Container>
      <AlignLeft>{left.map((child, index) => child && <Fragment key={index}>{child}</Fragment>)}</AlignLeft>
      <PositionCenter>{center.map((child, index) => child && <Fragment key={index}>{child}</Fragment>)}</PositionCenter>
      <AlignRight>{right.map((child, index) => child && <Fragment key={index}>{child}</Fragment>)}</AlignRight>
    </Container>
  );
};

export { Header, type HeaderProps };
