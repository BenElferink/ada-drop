import React, { type FC } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { Tooltip } from '../tooltip';
import { SignalType } from '@odigos/ui-kit/types';
import { FlexRow } from '@odigos/ui-kit/components/styled';
import { MONITORS_OPTIONS } from '@odigos/ui-kit/constants';
import { capitalizeFirstLetter, getMonitorIcon } from '@odigos/ui-kit/functions';

interface MonitorsIconsProps {
  monitors?: SignalType[];
  withTooltips?: boolean;
  withLabels?: boolean;
  size?: number;
  color?: string;
}

const defaultMonitors = MONITORS_OPTIONS.map(({ id }) => id) as SignalType[];

const MonitorsIcons: FC<MonitorsIconsProps> = ({ monitors = defaultMonitors, withTooltips, withLabels, size = 12, color: clr }) => {
  const theme = Theme.useTheme();
  const color = clr || theme.text.grey;

  return (
    <FlexRow $gap={withLabels ? size : size / 2}>
      {monitors
        .filter((str) => !!str)
        .map((str) => {
          const signal = str.toLowerCase() as SignalType;
          const displayName = capitalizeFirstLetter(signal);
          const Icon = getMonitorIcon(signal);

          if (!Icon) return null;

          return (
            <Tooltip key={signal} text={withTooltips ? displayName : ''}>
              <FlexRow $gap={size / 3}>
                <Icon size={withLabels ? size + 2 : size} fill={color} />

                {withLabels && (
                  <Text size={size} color={color}>
                    {displayName}
                  </Text>
                )}
              </FlexRow>
            </Tooltip>
          );
        })}
    </FlexRow>
  );
};

export { MonitorsIcons, type MonitorsIconsProps };
