import { getIdFromSseTarget } from '@odigos/ui-kit/functions';
import { EntityTypes, type Notification } from '@odigos/ui-kit/types';
import { useDrawerStore, useNotificationStore } from '@odigos/ui-kit/store';

const useClickNotification = () => {
  const { setDrawerType, setDrawerEntityId } = useDrawerStore();
  const { markAsDismissed, markAsSeen } = useNotificationStore();

  const onClickNotification = (notif: Pick<Notification, 'id' | 'crdType' | 'target'>, options?: { dismissToast?: boolean }) => {
    const { id, crdType, target } = notif;
    const { dismissToast } = options || {};

    if (crdType && target) {
      switch (crdType) {
        case EntityTypes.InstrumentationRule:
          setDrawerType(EntityTypes.InstrumentationRule);
          setDrawerEntityId(getIdFromSseTarget(target, EntityTypes.InstrumentationRule));
          break;

        case EntityTypes.Source:
        case 'InstrumentationConfig':
        case 'InstrumentationInstance':
          setDrawerType(EntityTypes.Source);
          setDrawerEntityId(getIdFromSseTarget(target, EntityTypes.Source));
          break;

        case EntityTypes.Action:
          setDrawerType(EntityTypes.Action);
          setDrawerEntityId(getIdFromSseTarget(target, EntityTypes.Action));
          break;

        case EntityTypes.Destination:
        case 'Destination':
          setDrawerType(EntityTypes.Destination);
          setDrawerEntityId(getIdFromSseTarget(target, EntityTypes.Destination));
          break;

        default:
          console.warn('notif click not handled for:', { crdType, target });
          break;
      }
    }

    markAsSeen(id);
    if (dismissToast) markAsDismissed(id);
  };

  return { onClickNotification };
};

export { useClickNotification };
