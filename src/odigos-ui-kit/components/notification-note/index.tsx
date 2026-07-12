import React, { type CSSProperties, type FC, useEffect, useRef, useState } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { XIcon } from '@odigos/ui-kit/icons';
import { Divider } from '../divider';
import styled from 'styled-components';
import { IconButton } from '../icon-button';
import { getStatusIcon } from '@odigos/ui-kit/functions';
import { FlexRow } from '@odigos/ui-kit/components/styled';
import { StatusType, type SVG } from '@odigos/ui-kit/types';

interface OnCloseParams {
  asSeen: boolean;
}

interface NotificationNoteProps {
  id?: string;
  type: StatusType;
  icon?: SVG; // only if we want to override the default status-icon (e.g. assigning "info" icon on "default" status)
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  onClose?: (params: OnCloseParams) => void;
  duration?: number;
  overrideMaxWidth?: CSSProperties['width'];
  style?: CSSProperties;
}

const Container = styled.div<{ $isLeaving?: boolean; $duration: number }>`
  position: relative;
  &.animated {
    overflow: hidden;
    padding-bottom: 1px;
    border-radius: 32px;
    animation: ${({ $isLeaving }) => ($isLeaving ? Theme.animations.slide.out['top'] : Theme.animations.slide.in['top'])} ${({ $duration }) => $duration / 10}ms forwards;
  }
`;

const DurationAnimation = styled.div<{ $type: NotificationNoteProps['type']; $duration: number }>`
  position: absolute;
  bottom: -1px;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  border-radius: 32px;
  background-color: ${({ $type, theme }) => theme.text[$type]};
  animation: ${Theme.animations.progress.out} ${({ $duration }) => `${$duration - $duration / 10}`}ms forwards;
`;

const Content = styled.div<{ $type: NotificationNoteProps['type'] }>`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  padding: 0 12px;
  border-radius: 32px;
  background-color: ${({ $type, theme }) => theme.colors[$type]};
`;

const TextWrapper = styled.div<{ $withAction: boolean; $overrideMaxWidth: NotificationNoteProps['overrideMaxWidth'] }>`
  display: flex;
  align-items: center;
  margin: 0 auto 0 0;
  padding: 8px 0;
  max-width: ${({ $withAction, $overrideMaxWidth }) => $overrideMaxWidth || ($withAction ? '400px' : '500px')};
  min-height: 12px;
`;

const Title = styled(Text)<{ $type: NotificationNoteProps['type'] }>`
  font-size: 14px;
  color: ${({ $type, theme }) => theme.text[$type]};
`;

const Message = styled(Text)<{ $type: NotificationNoteProps['type'] }>`
  color: ${({ $type, theme }) => theme.text[$type]};
  font-size: 12px;
`;

const ButtonsWrapper = styled(FlexRow)``;

const ActionButton = styled(Text)`
  text-transform: uppercase;
  text-decoration: underline;
  font-size: 12px;
  font-family: ${({ theme }) => theme.font_family.secondary};
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
    transition: transform 0.3s;
  }
`;

const NotificationNote: FC<NotificationNoteProps> = ({ type, icon, title, message, action, onClose, duration = 5000, overrideMaxWidth, style }) => {
  const theme = Theme.useTheme();

  // These are for handling transitions:
  // isLeaving - to trigger the slide-out animation
  const [isLeaving, setIsLeaving] = useState(false);

  // These are for handling on-hover events (pause/resume the progress bar animation & timeout for auto-close/dismiss)
  const timerForClosure = useRef<NodeJS.Timeout | null>(null);
  const progress = useRef<HTMLDivElement | null>(null);

  const closeToast = (params: OnCloseParams) => {
    if (onClose) {
      setIsLeaving(true);
      onClose({ asSeen: params?.asSeen });
    }
  };

  useEffect(() => {
    timerForClosure.current = setTimeout(() => closeToast({ asSeen: false }), duration);
    return () => {
      if (timerForClosure.current) clearTimeout(timerForClosure.current);
    };
  }, [duration]);

  const handleMouseEnter = () => {
    if (timerForClosure.current) clearTimeout(timerForClosure.current);
    if (progress.current) progress.current.style.animationPlayState = 'paused';
  };

  const handleMouseLeave = () => {
    if (progress.current) {
      const remainingTime = (progress.current.offsetWidth / (progress.current.parentElement as HTMLDivElement).offsetWidth) * duration;

      timerForClosure.current = setTimeout(() => closeToast({ asSeen: false }), remainingTime);
      progress.current.style.animationPlayState = 'running';
    }
  };

  const StatusIcon = icon || getStatusIcon(type, theme);

  return (
    <Container className={onClose ? 'animated' : ''} $duration={duration} $isLeaving={isLeaving} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Content data-id='toast' $type={type} style={style}>
        <StatusIcon fill={theme.text[type]} />

        <TextWrapper $withAction={!!action} $overrideMaxWidth={overrideMaxWidth}>
          {title && <Title $type={type}>{title}</Title>}
          {title && message && <Divider orientation='vertical' type={type} />}
          {message && <Message $type={type}>{message}</Message>}
        </TextWrapper>

        {(!!action || !!onClose) && (
          <ButtonsWrapper>
            {action && (
              <ActionButton data-id='toast-action' onClick={action.onClick}>
                {action.label}
              </ActionButton>
            )}
            {onClose && (
              <IconButton data-id='toast-close' onClick={() => closeToast({ asSeen: true })}>
                <XIcon size={12} />
              </IconButton>
            )}
          </ButtonsWrapper>
        )}
      </Content>

      {onClose && <DurationAnimation ref={progress} $duration={duration} $type={type} />}
    </Container>
  );
};

export { NotificationNote, type NotificationNoteProps };
