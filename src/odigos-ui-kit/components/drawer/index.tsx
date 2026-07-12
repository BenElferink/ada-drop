import React, { type ReactNode, type FC } from 'react';
import ReactDOM from 'react-dom';
import Theme from '@odigos/ui-kit/theme';
import styled from 'styled-components';
import { Overlay } from '@odigos/ui-kit/components/styled';
import { useKeyDown, useTransition } from '@odigos/ui-kit/hooks';
import { DrawerHeader, DrawerHeaderProps } from './drawer-header';
import { DrawerFooter, DrawerFooterProps } from './drawer-footer';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  position?: 'right' | 'left';
  width?: string;
  children: ReactNode;
  header: Omit<DrawerHeaderProps, 'onClose'>;
  footer: DrawerFooterProps;
}

const Container = styled.div<{
  $position: DrawerProps['position'];
  $width: DrawerProps['width'];
}>`
  position: fixed;
  top: 0;
  bottom: 0;
  ${({ $position }) => $position}: 0;
  z-index: 1000;
  width: ${({ $width }) => $width};
  background: ${({ theme }) => theme.colors.translucent_bg};
  box-shadow: 0 2px 10px ${({ theme }) => theme.colors.primary + Theme.opacity.hex['010']};
  overflow-y: auto;
`;

const DrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 24px 32px;
  overflow-y: auto;
`;

const Drawer: FC<DrawerProps> = ({ isOpen, onClose, closeOnEscape = true, position = 'right', width = '300px', children, header: headerProps, footer: footerProps }) => {
  useKeyDown(
    {
      key: 'Escape',
      active: isOpen && closeOnEscape,
    },
    () => onClose(),
  );

  const Transition = useTransition({
    container: Container,
    animateIn: Theme.animations.slide.in[position],
    animateOut: Theme.animations.slide.out[position],
  });

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <Overlay hidden={!isOpen} onClick={onClose} />

      <Transition data-id='drawer' enter={isOpen} $position={position} $width={width}>
        <DrawerBody>
          <DrawerHeader onClose={onClose} {...headerProps} />
          <Content>{children}</Content>
          <DrawerFooter {...footerProps} />
        </DrawerBody>
      </Transition>
    </>,
    document.body,
  );
};

export { Drawer, type DrawerProps, DrawerHeader, type DrawerHeaderProps, DrawerFooter, type DrawerFooterProps };
