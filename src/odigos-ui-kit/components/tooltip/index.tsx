import React, { useState, type PropsWithChildren, useRef, type MouseEvent, forwardRef, type FC } from 'react';
import ReactDOM from 'react-dom';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import type { SVG } from '@odigos/ui-kit/types';
import { InfoIcon } from '@odigos/ui-kit/icons';
import styled from 'styled-components';
import { FlexRow } from '@odigos/ui-kit/components/styled';

interface Position {
  top: number;
  left: number;
}

interface TooltipProps extends PropsWithChildren {
  withIcon?: boolean;
  titleIcon?: SVG;
  title?: string;
  text?: string;
  timestamp?: string | number | Date;
}

interface PopupProps extends PropsWithChildren, Position {}

const TooltipContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: help;
`;

const TextBreakWord = styled(Text)`
  word-break: break-word;
  white-space: pre-wrap;
`;

const Tooltip: FC<TooltipProps> = ({ withIcon, titleIcon: TitleIcon, title, text, timestamp, children }) => {
  const theme = Theme.useTheme();

  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState<Position>({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const handleMouseEvent = (e: MouseEvent) => {
    const { type, clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    let top = clientY;
    let left = clientX;

    if (top >= innerHeight / 2) top += -(popupRef.current?.clientHeight || 40);
    if (left >= innerWidth / 2) left += -(popupRef.current?.clientWidth || Math.min((text?.length || 0) * 7.5, 300));

    setPopupPosition({ top, left });
    setIsHovered(type !== 'mouseleave');
  };

  if (!text) return <>{children}</>;

  return (
    <TooltipContainer onMouseEnter={handleMouseEvent} onMouseMove={handleMouseEvent} onMouseLeave={handleMouseEvent}>
      {children}
      {withIcon && <InfoIcon />}
      {isHovered && (
        <Popup ref={popupRef} {...popupPosition}>
          <Text size={12} color={theme.text.secondary}>
            {(!!TitleIcon || !!title) && (
              <FlexRow style={{ marginBottom: '4px' }} $gap={4}>
                {TitleIcon && <TitleIcon fill={theme.text.secondary} size={12} />}
                {title && <>{title}&nbsp;-&nbsp;</>}
              </FlexRow>
            )}

            <TextBreakWord size={12} color={theme.text.info}>
              {text}
            </TextBreakWord>

            {!!timestamp && (
              <Text size={10} color={theme.text.darker_grey} family='secondary' style={{ marginTop: '8px' }}>
                {new Date(timestamp).toLocaleString()}
              </Text>
            )}
          </Text>
        </Popup>
      )}
    </TooltipContainer>
  );
};

const PopupContainer = styled.div<{ $top: number; $left: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  z-index: 9999;

  max-width: 270px;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.info};

  pointer-events: none;
`;

const Popup = forwardRef<HTMLDivElement, PopupProps>(({ top, left, children }, ref) => {
  return ReactDOM.createPortal(
    <PopupContainer ref={ref} $top={top} $left={left}>
      {children}
    </PopupContainer>,
    document.body,
  );
});

export { Tooltip, type TooltipProps };
