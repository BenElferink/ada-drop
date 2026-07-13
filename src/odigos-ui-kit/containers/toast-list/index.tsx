import React from 'react';
import styled from 'styled-components';
import { useNotificationStore } from '@odigos/ui-kit/store';
import { useClickNotification } from '@odigos/ui-kit/hooks';
import { NotificationNote } from '@odigos/ui-kit/components';

interface ToastListProps {}

const Container = styled.div`
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  min-width: 600px;
`;

const ToastList: React.FC<ToastListProps> = () => {
  const { notifications, markAsDismissed, markAsSeen } = useNotificationStore();
  const { onClickNotification } = useClickNotification();

  const onClose = ({ id, asSeen }: { id: string; asSeen: boolean }) => {
    markAsDismissed(id);
    if (asSeen) markAsSeen(id);
  };

  return (
    <Container>
      {notifications
        .filter(({ dismissed }) => !dismissed)
        .map(({ id, type, title, message, crdType, target }) => (
          <NotificationNote
            key={`toast-${id}`}
            id={id}
            type={type}
            title={title}
            message={message}
            action={
              crdType && target
                ? {
                    label: 'go to details',
                    onClick: () =>
                      onClickNotification(
                        {
                          id,
                          crdType,
                          target,
                        },
                        {
                          dismissToast: true,
                        },
                      ),
                  }
                : undefined
            }
            onClose={() => onClose({ id, asSeen: true })}
          />
        ))}
    </Container>
  );
};

export { ToastList, type ToastListProps };
