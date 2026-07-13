import React, { FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { PlusIcon } from '@odigos/ui-kit/icons';
import { BUTTON_TEXTS } from '@odigos/ui-kit/constants';
import { Button, type ButtonProps, Text } from '@odigos/ui-kit/components';

interface AddButtonProps extends ButtonProps {
  label?: string;
}

const AddButton: FC<AddButtonProps> = ({ label, onClick, variant = 'tertiary', ...props }) => {
  const theme = Theme.useTheme();

  return (
    <Button onClick={onClick} variant={variant} {...props}>
      <PlusIcon fill={variant === 'primary' ? theme.text.primary : theme.text.info} />
      <Text size={14} family='secondary' decoration='underline' color={variant === 'primary' ? theme.text.primary : undefined}>
        {label || BUTTON_TEXTS.ADD}
      </Text>
    </Button>
  );
};

export { AddButton, type AddButtonProps };
