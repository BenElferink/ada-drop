import React, { type FC, type CSSProperties } from 'react';
import { Text } from '../text';
import { Tooltip } from '../tooltip';
import styled from 'styled-components';

interface FieldLabelProps {
  title?: string;
  required?: boolean;
  tooltip?: string;
  style?: CSSProperties;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const Title = styled(Text)`
  font-size: 14px;
  opacity: 0.8;
  line-height: 22px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const OptionalText = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.text.darker_grey};
  opacity: 0.8;
`;

const FieldLabel: FC<FieldLabelProps> = ({ title, required, tooltip, style }) => {
  if (!title) return null;

  return (
    <Wrapper style={style}>
      <Tooltip text={tooltip} withIcon>
        <Title>{title}</Title>
        {!required && <OptionalText>(optional)</OptionalText>}
      </Tooltip>
    </Wrapper>
  );
};

export { FieldLabel, type FieldLabelProps };
