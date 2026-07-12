import { type Condition, ProgrammingLanguages } from '../common';
import type { NamespaceSelectionFormData, SourceSelectionFormData } from '@odigos/ui-kit/store';

export enum K8sResourceKind {
  Deployment = 'Deployment',
  DaemonSet = 'DaemonSet',
  StatefulSet = 'StatefulSet',
  CronJob = 'CronJob',
}

export interface WorkloadId {
  namespace: string;
  name: string;
  kind: K8sResourceKind | ''; // Empty string is important for default form values
}

export interface Source extends WorkloadId {
  selected: boolean;
  otelServiceName: string;
  numberOfInstances?: number;
  dataStreamNames: string[];
  containers:
    | {
        containerName: string;
        language: ProgrammingLanguages;
        runtimeVersion: string;
        overriden?: boolean;
        instrumented: boolean;
        instrumentationMessage: string;
        otelDistroName: string | null;
      }[]
    | null;
  conditions: Condition[] | null;
}

export interface SourceFormData {
  otelServiceName?: string;
  currentStreamName?: string;

  // for runtime override
  containerName?: string;
  language?: ProgrammingLanguages | null;
  version?: string;
}

export type PersistSources = (selectAppsList: SourceSelectionFormData, futureSelectAppsList: NamespaceSelectionFormData) => void;
