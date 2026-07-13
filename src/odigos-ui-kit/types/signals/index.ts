export enum SignalType {
  Logs = 'logs',
  Metrics = 'metrics',
  Traces = 'traces',
}

export interface MonitorsOption {
  id: SignalType;
  value: string;
}
