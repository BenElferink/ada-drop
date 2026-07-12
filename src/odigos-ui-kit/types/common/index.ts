import type { FC, MouseEventHandler } from 'react';

export type SVG = FC<{
  /**
   * Size of the SVG icon
   */
  size?: number;
  /**
   * Fill color of the SVG icon
   */
  fill?: string;
  /**
   * Rotate the SVG icon by a number of degrees
   */
  rotate?: number;
  /**
   * Click handler for the SVG icon
   */
  onClick?: MouseEventHandler<SVGSVGElement>;
}>;

export enum Tier {
  Community = 'community',
  Cloud = 'cloud',
  Onprem = 'onprem',
}

export enum PlatformType {
  K8s = 'k8s',
  Vm = 'vm',
}

export enum ProgrammingLanguages {
  Go = 'go',
  JavaScript = 'javascript',
  Python = 'python',
  Java = 'java',
  DotNet = 'dotnet',
  CSharp = 'csharp',
  CPlusPlus = 'cplusplus',
  Php = 'php',
  Ruby = 'ruby',
  Rust = 'rust',
  Swift = 'swift',
  Elixir = 'elixir',
  MySql = 'mysql',
  Nginx = 'nginx',
  Postgres = 'postgres',
  Redis = 'redis',
  Kafka = 'kafka',

  Ignored = 'ignored',
  Unknown = 'unknown', // language detection completed but could not find a supported language
  Processing = 'processing', // language detection is not yet complotted, data is not available
  NoContainers = 'no containers', // language detection completed but no containers found or they are ignored
  NoRunningPods = 'no running pods', // no running pods are available for language detection
}

export enum Crud {
  Create = 'Create',
  Read = 'Read',
  Update = 'Update',
  Delete = 'Delete',
}

export enum EntityTypes {
  Namespace = 'Namespace',
  Source = 'Source',
  Destination = 'Destination',
  Action = 'Action',
  InstrumentationRule = 'InstrumentationRule',
}

export enum OtherEntityTypes {
  DataStream = 'DataStream',
}

export enum FieldTypes {
  Input = 'input',
  MultiInput = 'multiInput',
  MultiTabledInput = 'multiTabledInput', // not used by dests, but is in form components
  KeyValuePair = 'keyValuePairs',
  TextArea = 'textarea',
  Dropdown = 'dropdown',
  Checkbox = 'checkbox',
  Toggle = 'toggle', // not used by dests, but is in form components
}

export enum InputTypes {
  Text = 'text',
  Password = 'password',
  Number = 'number',
}

export enum StatusType {
  Warning = 'warning',
  Error = 'error',
  Success = 'success',
  Info = 'info',
  Default = 'default',
}

export enum IntrumentationStatus {
  INSTRUMENTED = 'Instrumented',
  INSTRUMENTING = 'Instrumenting',
  UNINSTRUMENTED = 'Uninstrumented',
  NOT_INSTRUMENTED = 'Not Instrumented',
}

export enum OtherStatus {
  Loading = 'loading',
  Disabled = 'disabled',
}

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export interface Condition {
  status: StatusType | OtherStatus;
  type: string;
  reason?: string | null;
  message?: string | null;
  lastTransitionTime: string;
}

export interface Notification {
  id: string;
  type: StatusType;
  title?: string;
  message?: string;
  crdType?: string;
  target?: string;
  dismissed: boolean;
  seen: boolean;
  hideFromHistory?: boolean;
  time: string;
}

export type CustomFieldProps<T = Record<string, any>> = {
  value: T;
  setValue: (key: keyof T, value: any) => void;
  formErrors: Record<string, string>;
};
