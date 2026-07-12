import type { Comparison } from '@odigos/ui-kit/functions';
import type { DropdownProps } from '@odigos/ui-kit/components';
import { type Condition, FieldTypes, SVG } from '../common';

export enum DestinationTypes {
  Alauda = 'alauda',
  AlibabaCloud = 'alibabacloud',
  AppDynamics = 'appdynamics',
  Axiom = 'axiom',
  AzureBlob = 'azureblob',
  BetterStack = 'betterstack',
  Bonree = 'bonree',
  Causely = 'causely',
  Checkly = 'checkly',
  Chronosphere = 'chronosphere',
  ClickHouse = 'clickhouse',
  CloudWatch = 'cloudwatch',
  Coralogix = 'coralogix',
  Dash0 = 'dash0',
  Datadog = 'datadog',
  Dynamic = 'dynamic',
  Dynatrace = 'dynatrace',
  ElasticApm = 'elasticapm',
  ElasticSearch = 'elasticsearch',
  GoogleCloud = 'googlecloud',
  GrafanaCloudLoki = 'grafanacloudloki',
  GrafanaCloudPrometheus = 'grafanacloudprometheus',
  GrafanaCloudTempo = 'grafanacloudtempo',
  Greptime = 'greptime',
  Groundcover = 'groundcover',
  Honeycomb = 'honeycomb',
  HyperDX = 'hyperdx',
  Instana = 'instana',
  Jaeger = 'jaeger',
  Kafka = 'kafka',
  Kloudmate = 'kloudmate',
  Last9 = 'last9',
  Lightstep = 'lightstep',
  LogzIo = 'logzio',
  Loki = 'loki',
  Lumigo = 'lumigo',
  Middleware = 'middleware',
  NewRelic = 'newrelic',
  Observe = 'observe',
  OneUptime = 'oneuptime',
  OpenObserve = 'openobserve',
  Opsverse = 'opsverse',
  Oracle = 'oracle',
  OTLP = 'otlp',
  OTLPHttp = 'otlphttp',
  Prometheus = 'prometheus',
  Qryn = 'qryn',
  QrynOss = 'qryn-oss',
  Quickwit = 'quickwit',
  S3 = 's3',
  Seq = 'seq',
  Signoz = 'signoz',
  Splunk = 'splunk',
  SplunkSapm = 'splunksapm',
  SplunkOtlp = 'splunkotlp',
  SumoLogic = 'sumologic',
  TelemetryHub = 'telemetryhub',
  Tempo = 'tempo',
  Tingyun = 'tingyun',
  Traceloop = 'traceloop',
  Uptrace = 'uptrace',
  VictoriaMetrics = 'victoriametrics',
  VictoriaMetricsCloud = 'victoriametricscloud',
  XRay = 'xray',
}

export interface Destination {
  id: string;
  name: string;
  dataStreamNames: string[];
  exportedSignals: {
    traces: boolean;
    metrics: boolean;
    logs: boolean;
  };
  fields: string;
  conditions: Condition[] | null;
  destinationType: {
    type: DestinationTypes;
    displayName: string;
    supportedSignals: {
      logs: {
        supported: boolean;
      };
      metrics: {
        supported: boolean;
      };
      traces: {
        supported: boolean;
      };
    };
  };
}

type YamlCompareArr = [string, Comparison, string] | ['true' | 'false'];

export interface DestinationYamlProperties {
  name: string; // keyName (e.g. JAEGER_ENDPOINT_URL)
  componentType: FieldTypes;
  componentProperties?: string;
  displayName?: string;
  secret?: boolean;
  initialValue?: string;
  renderCondition?: YamlCompareArr;
  hideFromReadData?: YamlCompareArr;
  customReadDataLabels?: {
    condition: string;
    title: string;
    value: string;
  }[];
}

export interface DestinationOption {
  id?: string; // for existing destinations
  selected?: boolean; // for existing destinations

  type: Destination['destinationType']['type'];
  displayName: Destination['destinationType']['displayName'];
  supportedSignals: Destination['destinationType']['supportedSignals'];
  testConnectionSupported: boolean;
  fields: DestinationYamlProperties[];
}

export type DestinationCategories = {
  icon?: SVG;
  name: string; // if fetched, then equal one-of ['managed', 'self hosted']
  description: string;
  items: DestinationOption[];
}[];

export interface DestinationFormData {
  type: Destination['destinationType']['type'];
  name: Destination['destinationType']['displayName'];
  currentStreamName: string; // to be added into an array of stream names
  exportedSignals: Destination['exportedSignals'];
  fields: { key: string; value: string }[];
}

export interface DestinationDynamicField {
  name: DestinationYamlProperties['name'];
  componentType: DestinationYamlProperties['componentType'];
  title: DestinationYamlProperties['displayName'];
  value: DestinationYamlProperties['initialValue'];
  renderCondition?: DestinationYamlProperties['renderCondition'];

  // from "componentProperties"
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: DropdownProps['options'];
}

export interface TestConnectionResponse {
  succeeded: boolean;
  message: string;
  reason: string;
  destinationType?: DestinationTypes;
}

export type TestConnectionFunc = (payload: DestinationFormData) => Promise<TestConnectionResponse | undefined>;
