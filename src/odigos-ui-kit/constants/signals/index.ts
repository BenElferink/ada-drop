import { SignalType, type MonitorsOption } from '@odigos/ui-kit/types';

export const MONITORS_OPTIONS: MonitorsOption[] = [
  {
    id: SignalType.Logs,
    value: 'Logs',
  },
  {
    id: SignalType.Metrics,
    value: 'Metrics',
  },
  {
    id: SignalType.Traces,
    value: 'Traces',
  },
];
