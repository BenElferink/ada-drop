export const DEFAULT_DATA_STREAM_NAME = 'default';

export const STORAGE_KEYS = {
  SELECTED_DATA_STREAM: 'SELECTED_DATA_STREAM',
  SELECTED_DATA_STREAM_WITH_PROXY: (proxyId: string) => `SELECTED_DATA_STREAM_${proxyId}`,
  OVERVIEW_FILTERS: 'OVERVIEW_FILTERS',
  DARK_MODE: 'DARK_MODE',
};

export const FORM_ALERTS = {
  REQUIRED_FIELDS: 'Required fields are missing',
  FIELD_IS_REQUIRED: 'This field is required',
  FORBIDDEN: 'Forbidden',
  ENTERPRISE_ONLY: (str: string = 'This') => `${str} is an Enterprise feature. Please upgrade your plan.`,
  DEFINED_FOR_ALL_STREAMS: (str: string) => `${str} are defined for all Data Streams.`,
  CANNOT_EDIT_RULE: 'Cannot edit a system-managed instrumentation rule',
  CANNOT_DELETE_RULE: 'Cannot delete a system-managed instrumentation rule',
  LATENCY_HTTP_ROUTE: 'HTTP route must start with a forward slash "/"',
  READONLY_WARNING: "You're not allowed to create/update/delete in readonly mode",
  ILLEGAL_K8S_LABEL: 'Must be 63 characters or less, must consist of alphanumeric characters, "-", "_", or ".", and must start & end with an alphanumeric character (e.g., my-name, 123.abc).',
  INVALID_VERSION: 'Invalid version format, must be in the format of "major.minor.patch" (e.g. 1.0.0)',
};

export const DISPLAY_TITLES = {
  NAMESPACE: 'Namespace',
  NAME: 'Name',
  KIND: 'Kind',

  CONNECTION: 'Connection',
  CONNECTIONS: 'Connections',

  DATA_STREAM: 'Data Stream',
  DATA_STREAMS: 'Data Streams',
  STREAM_NAME: 'Data Stream Name',
  NAME_YOUR_STREAM: 'Name your Data Stream',
  NAME_YOUR_STREAM_PLACEHOLDER: 'e.g. Highest priority',
  STREAM_DESCRIPTION: 'Provide a clear and descriptive name for your pipeline to ensure its purpose is easily understood by you and your team.',
  STREAM_CONFIRM: 'Confirm your new Data Stream',
  DATA_STREAM_EXISTS_WARNING: (curr: string, next: string) => `A Data Stream with this name already exists, you can still rename the current "${curr}", but it will merge into the existing "${next}".`,

  ACTION: 'Action',
  ACTIONS: 'Actions',
  ADD_ACTION: 'Add Action',
  ACTION_DETAILS: 'Action Details',

  INSTRUMENTATION_RULE: 'Instrumentation Rule',
  INSTRUMENTATION_RULES: 'Instrumentation Rules',
  ADD_INSTRUMENTATION_RULE: 'Add Instrumentation Rule',
  INSTRUMENTATION_RULE_DETAILS: 'Instrumentation Rule Details',

  DESTINATION: 'Destination',
  DESTINATIONS: 'Destinations',
  ADD_DESTINATION: 'Add Destination',
  ADD_DESTINATIONS: 'Add Destinations',
  ADD_DESTINATION_DESCRIPTION: 'Add a destination to send your telemetry data to. You can add multiple destinations.',
  DESTINATION_DETAILS: 'Destination Details',
  SELECTED_DESTINATIONS: 'Selected Destinations',

  SOURCE: 'Source',
  SOURCES: 'Sources',
  ADD_SOURCE: 'Add Source',
  SOURCE_DETAILS: 'Source Details',
  SELECT_SOURCES: 'Select Sources',
  SELECTED_SOURCES: 'Selected Sources',
  SELECT_SOURCES_DESCRIPTION: 'Choose which sources to monitor in your pipeline by searching by source name or namespace.',
  NO_SOURCES: 'No sources',
  NO_SOURCES_GO_BACK: 'No sources selected. Please go back to select sources.',
  PLEASE_ADD_SOURCE: 'Please add a source',
  NO_SOURCES_NAMESPACE: 'No sources available in this namespace',
  TRY_SEARCH_OR_OTHER_NAMESPACE: 'Try searching again or select another namespace.',
  PLEASE_MAKE_SURE_UNIGNORED_NAMESPACES: 'Please make sure your cluster has unignored namespaces',

  INSTALLATION: 'Installation',
  SUMMARY: 'Summary',
  TYPE: 'Type',
  NOTES: 'Notes',
  STATUS: 'Status',
  READONLY: 'Readonly',
  LANGUAGE: 'Language',
  VERSION: 'Version',
  RUNTIME_VERSION: 'Runtime Version',
  VERSION_PLACEHOLDER: '1.0.0',
  MONITORS: 'Monitors',
  SIGNALS_FOR_PROCESSING: 'Signals for Processing',
  MANAGED_BY_PROFILE: 'Managed by Profile',

  API_TOKEN: 'API Token',
  API_TOKENS: 'API Tokens',
  DESCRIBE_ODIGOS: 'Describe Odigos',
  DESCRIBE_SOURCE: 'Describe Source',

  DETECTED_CONTAINERS: 'Detected Containers',
  DETECTED_CONTAINERS_DESCRIPTION: 'The system automatically instruments the containers it detects with a supported programming language.',
  CONTAINER_NAME: 'Container Name',

  FILTERED_COUNT_TOOLTIP: 'Represents filtered amount, out of total amount',

  SEARCH_NAMESPACES: 'Search Namespaces',
  SEARCH_SOURCES: 'Search Sources',
  SHOW_SELECTED_ONLY: 'Show selected only',
  TO_COLLECT_OTEL_DATA: 'To collect OpenTelemetry data',
  TO_MONITOR_OTEL_DATA: 'To monitor OpenTelemetry data',
  TO_MODIFY_OTEL_DATA: 'To modify OpenTelemetry data',

  QUICK_BACK_TO_SUMMARY: 'When you finish editing you can quickly go back to the summary.',
  GO_TO_SUMMARY: 'Go to summary',

  FUTURE_APPS_TITLE: 'Auto-instrument new apps',
  FUTURE_APPS_DESCRIPTION: 'When enabled, new applications will be instrumented automatically and included in the current data stream.',

  OVERIDE: 'Override',
  OVERIDDEN: 'Overridden',
  OVERRIDE_RUNTIME_DETAILS: 'Override Runtime Details',
  OVERRIDE_RUNTIME_WARNING: 'This is an advanced configuration. If the selected programming language is incorrect, data collection may be incomplete or may not occur at all.',
};

export const BUTTON_TEXTS = {
  ADD: 'Add',
  ADD_NEW: 'Add New',
  NEW: 'New',
  SELECT: 'Select',
  CREATE: 'Create',
  UPDATE: 'Update',
  EDIT: 'Edit',
  DELETE: 'Delete',
  CANCEL: 'Cancel',
  DONE: 'Done',
  SAVE: 'Save',
  BACK: 'Back',
  NEXT: 'Next',
  TEST: 'Test',
  TEST_CONNECTION: 'Test Connection',
  INSTRUMENT: 'Instrument',
  UNINSTRUMENT: 'Uninstrument',
};
