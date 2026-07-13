import React, { type CSSProperties, type FC, type MouseEventHandler, useEffect, useState } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { Tooltip } from '../tooltip';
import styled from 'styled-components';
import { FlexColumn } from '@odigos/ui-kit/components/styled';
import { FieldError } from '../field-error';
import { CheckIcon, MinusIcon } from '@odigos/ui-kit/icons';

interface CheckboxProps {
  title?: string;
  titleColor?: CSSProperties['color'];
  tooltip?: string;
  value?: boolean;
  partiallyChecked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  style?: CSSProperties;
  errorMessage?: string;
  allowPropagation?: boolean;
}

const Container = styled.div<{ $disabled?: CheckboxProps['disabled'] }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

const CheckboxWrapper = styled.div<{ $isChecked: boolean; $isPartiallyChecked: boolean; $disabled?: CheckboxProps['disabled'] }>`
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1px dashed ${({ $isChecked, $isPartiallyChecked, theme }) => ($isChecked || $isPartiallyChecked ? 'transparent' : theme.colors.secondary)};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isChecked, $isPartiallyChecked, theme }) =>
    $isChecked ? theme.colors.majestic_blue : $isPartiallyChecked ? theme.colors.majestic_blue_soft : theme.colors.secondary + Theme.opacity.hex['020']};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  transition: border 0.3s;
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.secondary};
  }
`;

const Checkbox: FC<CheckboxProps> = ({ title, titleColor, tooltip, value = false, partiallyChecked = false, onChange, disabled, style, errorMessage, allowPropagation = false }) => {
  const theme = Theme.useTheme();

  const [isChecked, setIsChecked] = useState(value);
  useEffect(() => setIsChecked(value), [value]);

  const handleToggle: MouseEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    if (!allowPropagation) e.stopPropagation();

    if (onChange) onChange(partiallyChecked ? true : !isChecked);
    else setIsChecked((prev) => (partiallyChecked ? true : !prev));
  };

  return (
    <FlexColumn>
      <Container data-id={`checkbox${!!title ? `-${title}` : ''}`} $disabled={disabled} onClick={handleToggle} style={style}>
        <CheckboxWrapper $isChecked={isChecked} $isPartiallyChecked={partiallyChecked} $disabled={disabled}>
          {partiallyChecked ? <MinusIcon fill={theme.text.white} /> : isChecked ? <CheckIcon fill={theme.text.white} /> : null}
        </CheckboxWrapper>

        {title && (
          <Tooltip text={tooltip} withIcon>
            <Text size={12} color={titleColor || theme.text.grey} style={{ maxWidth: '90%' }}>
              {title}
            </Text>
          </Tooltip>
        )}
      </Container>

      {!!errorMessage && <FieldError>{errorMessage}</FieldError>}
    </FlexColumn>
  );
};

export { Checkbox, type CheckboxProps };
