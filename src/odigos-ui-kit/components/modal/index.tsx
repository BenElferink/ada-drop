import React, { type ReactNode, type FC } from 'react';
import ReactDOM from 'react-dom';
import Theme from '@odigos/ui-kit/theme';
import { Text } from '../text';
import { XIcon } from '@odigos/ui-kit/icons';
import styled from 'styled-components';
import { CenterThis, Overlay } from '@odigos/ui-kit/components/styled';
import { useKeyDown, useTransition } from '@odigos/ui-kit/hooks';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  noOverlay?: boolean;
  header?: {
    title: string;
  };
  actionComponent?: ReactNode;
  children: ReactNode;
  closeOnEscape?: boolean;
}

const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: fit-content;
  background: ${({ theme }) => theme.colors.translucent_bg};
  border: ${({ theme }) => `1px solid ${theme.colors.border}`};
  border-radius: 40px;
  box-shadow: ${({ theme }) => {
    const color = theme.colors.primary + Theme.opacity.hex['010'];
    return `0px 1px 1px 0px ${color}, 0px 2px 2px 0px ${color}, 0px 5px 5px 0px ${color}, 0px 10px 10px 0px ${color}, 0px 0px 8px 0px ${color}`;
  }};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 24px;
`;

const ModalCloseButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalContent = styled(CenterThis)`
  min-width: 350px;
  min-height: 150px;
`;

const ModalTitleContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  pointer-events: none;
`;

const ModalTitle = styled(Text)`
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.font_family.secondary};
  pointer-events: auto;
`;

const CancelText = styled(Text)`
  text-transform: uppercase;
  font-weight: 500;
  font-size: 14px;
  font-family: ${({ theme }) => theme.font_family.secondary};
  text-decoration: underline;
  cursor: pointer;
`;

const Modal: FC<ModalProps> = ({ isOpen, noOverlay, header, actionComponent, onClose, children, closeOnEscape = true }) => {
  useKeyDown(
    {
      key: 'Escape',
      active: isOpen && closeOnEscape,
    },
    () => onClose(),
  );

  const Transition = useTransition({
    container: Container,
    animateIn: Theme.animations.slide.in['center'],
    animateOut: Theme.animations.slide.out['center'],
  });

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <Overlay hidden={!isOpen} onClick={onClose} style={{ opacity: noOverlay ? 0 : 1 }} />

      <Transition data-id={`modal${header ? `-${header.title.replaceAll(' ', '-')}` : ''}`} enter={isOpen}>
        {header && (
          <ModalHeader>
            <ModalCloseButton onClick={onClose}>
              <XIcon />
              <CancelText>Cancel</CancelText>
            </ModalCloseButton>
            <ModalTitleContainer>
              <ModalTitle>{header.title}</ModalTitle>
            </ModalTitleContainer>
            <HeaderActionsWrapper>{actionComponent}</HeaderActionsWrapper>
          </ModalHeader>
        )}

        <ModalContent>{children}</ModalContent>
      </Transition>
    </>,
    document.body,
  );
};

export { Modal, type ModalProps };
