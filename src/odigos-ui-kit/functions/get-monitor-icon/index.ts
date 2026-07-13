import { SignalType, type SVG } from '@odigos/ui-kit/types';
import { LogsIcon, MetricsIcon, TracesIcon } from '@odigos/ui-kit/icons';

export const getMonitorIcon = (type: SignalType) => {
  const LOGOS: Record<SignalType, SVG> = {
    [SignalType.Logs]: LogsIcon,
    [SignalType.Metrics]: MetricsIcon,
    [SignalType.Traces]: TracesIcon,
  };

  return LOGOS[type];
};
