import React, { type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import type { SVG } from '@odigos/ui-kit/types';
import { Button } from '../button';
import { Tooltip } from '../tooltip';
import styled from 'styled-components';

interface IButton {
  label: string;
  icon?: SVG;
  iconSrc?: string;
  tooltip?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

interface NavigationButtonsProps {
  buttons: IButton[];
}

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 90px;
`;

const NavigationButtons: FC<NavigationButtonsProps> = ({ buttons }) => {
  const theme = Theme.useTheme();

  const shouldRenderBackButton = ({ button, index }: { button: IButton; index: number }) => {
    return buttons.length > 1 && index === 0 && (button.icon || button.iconSrc);
  };

  const renderButton = ({ button, rotate }: { button: IButton; rotate: number }) => {
    return button.icon ? (
      <button.icon size={14} rotate={rotate} fill={theme.text[button.variant || 'secondary']} />
    ) : button.iconSrc ? (
      <img src={button.iconSrc} alt={button.label} width={8} height={12} />
    ) : null;
  };

  return (
    <ButtonsContainer>
      {buttons.map((btn, index) => (
        <Tooltip key={index} text={btn.tooltip || ''}>
          <StyledButton key={index} variant={btn.variant || 'secondary'} onClick={btn.onClick} disabled={btn.disabled}>
            {shouldRenderBackButton({ button: btn, index }) && renderButton({ button: btn, rotate: 0 })}
            {btn.label}
            {!shouldRenderBackButton({ button: btn, index }) && renderButton({ button: btn, rotate: 180 })}
          </StyledButton>
        </Tooltip>
      ))}
    </ButtonsContainer>
  );
};

export { NavigationButtons, type NavigationButtonsProps };
