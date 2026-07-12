import { EntityTypes, K8sResourceKind, type WorkloadId } from '@odigos/ui-kit/types';

export const getIdFromSseTarget = (target: string, type: EntityTypes): string | WorkloadId => {
  switch (type) {
    case EntityTypes.Source: {
      const id: WorkloadId = {
        namespace: '',
        name: '',
        kind: '',
      };

      target.split('&').forEach((str) => {
        const [key, value] = str.split('=') as [keyof WorkloadId, K8sResourceKind];
        id[key] = value;
      });

      return id;
    }

    default:
      return target as string;
  }
};
