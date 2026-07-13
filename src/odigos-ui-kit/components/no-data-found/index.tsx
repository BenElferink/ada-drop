import React, { type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { NoDataIcon } from '@odigos/ui-kit/icons';
import styled from 'styled-components';

interface NoDataFoundProps {
  title?: string;
  subTitle?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled(Text)`
  color: ${({ theme }) => theme.text.darker_grey};
  line-height: 24px;
`;

const SubTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.border};
  font-size: 14px;
  font-weight: 200;
  line-height: 20px;
`;

const NoDataFound: FC<NoDataFoundProps> = ({ title = 'No data found', subTitle = 'Check your search phrase and try one more time' }) => {
  const theme = Theme.useTheme();

  return (
    <Container>
      <TitleWrapper>
        <NoDataIcon fill={theme.text.dark_grey} />
        <Title>{title}</Title>
      </TitleWrapper>
      {subTitle && <SubTitle>{subTitle}</SubTitle>}
    </Container>
  );
};

export { NoDataFound, type NoDataFoundProps };
