import React, { type ReactNode, type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import styled from 'styled-components';
import { getStatusIcon } from '@odigos/ui-kit/functions';
import { StatusType } from '@odigos/ui-kit/types';

interface BadgeProps {
  label: string | number | ReactNode;
  filled?: boolean;
  status?: StatusType;
  withIcon?: boolean;
  onClick?: () => void;
}

const Styled = styled.span<{ $filled: BadgeProps['filled']; $status: BadgeProps['status']; $clickable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 16px;
  min-width: 16px;
  width: fit-content;
  padding: 4px;
  gap: 2px;

  border-radius: 50px;
  border: 1px solid ${({ theme, $filled, $status }) => (!!$status ? theme.text[$status] + ($filled ? '' : Theme.opacity.hex['050']) : $filled ? 'transparent' : theme.colors.border)};
  background-color: ${({ theme, $filled, $status }) => ($filled ? (!!$status ? theme.colors[$status] : theme.colors.majestic_blue) : 'transparent')};
  color: ${({ theme, $filled, $status }) => ($filled && !!$status ? theme.text.secondary : $filled ? theme.text.white : !!$status ? theme.text[$status] : theme.text.grey)};
  font-family: ${({ theme }) => theme.font_family.secondary};
  font-size: 12px;
  white-space: nowrap;

  ${({ theme, $filled, $status, $clickable }) =>
    $clickable &&
    `&:hover {
      cursor: pointer;
      background-color: ${!!$status ? theme.colors[$status] + Theme.opacity.hex['020'] : $filled ? theme.colors.majestic_blue_soft : theme.colors.secondary + Theme.opacity.hex['020']};
    }`}
`;

const Badge: FC<BadgeProps> = ({ label, filled, status, withIcon, onClick }) => {
  const theme = Theme.useTheme();
  const Icon = !!status && withIcon ? getStatusIcon(status, theme) : null;

  return (
    <Styled $filled={filled} $status={status} $clickable={!!onClick} onClick={onClick}>
      {!!Icon && <Icon />}
      {label}
    </Styled>
  );
};

export { Badge, type BadgeProps };
