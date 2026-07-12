import React, { type FC } from 'react';
import { Text } from '../text';
import { Modal } from '../modal';
import { useKeyDown } from '@odigos/ui-kit/hooks';
import styled from 'styled-components';
import { StatusType } from '@odigos/ui-kit/types';
import { Button, type ButtonProps } from '../button';
import { NotificationNote } from '../notification-note';

interface ButtonParams {
  text: string;
  variant?: ButtonProps['variant'];
  onClick: () => void;
}

interface WarningModalProps {
  isOpen: boolean;
  noOverlay?: boolean;
  title: string;
  description: string;
  note?: {
    type: StatusType;
    title: string;
    message: string;
  };
  approveButton: ButtonParams;
  denyButton: ButtonParams;
  closeOnEscape?: boolean;
}

const Container = styled.div`
  padding: 24px 32px;
`;

const Content = styled.div<{ $withNote: boolean }>`
  padding: ${({ $withNote }) => ($withNote ? '12px 0px' : '12px 0px 32px 0')};
`;

const Title = styled(Text)`
  font-size: 20px;
  line-height: 28px;
`;

const Description = styled(Text)`
  color: ${({ theme }) => theme.text.grey};
  width: 416px;
  font-style: normal;
  font-weight: 300;
  line-height: 24px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const FooterButton = styled(Button)`
  width: 250px;
`;

const NoteWrapper = styled.div`
  margin-bottom: 12px;
`;

const WarningModal: FC<WarningModalProps> = ({ isOpen, noOverlay, title = '', description = '', note, approveButton, denyButton, closeOnEscape = true }) => {
  useKeyDown(
    {
      key: 'Enter',
      active: isOpen && closeOnEscape,
    },
    () => approveButton.onClick(),
  );

  const onApprove = () => approveButton.onClick();
  const onDeny = () => denyButton.onClick();

  return (
    <Modal isOpen={isOpen} noOverlay={noOverlay} onClose={onDeny}>
      <Container>
        <Title>{title}</Title>

        <Content $withNote={!!note}>
          <Description>{description}</Description>
        </Content>

        {!!note && (
          <NoteWrapper>
            <NotificationNote type={note.type} title={note.title} message={note.message} />
          </NoteWrapper>
        )}

        <Footer>
          <FooterButton data-id='approve' variant={approveButton.variant || 'primary'} onClick={onApprove}>
            {approveButton.text}
          </FooterButton>
          <FooterButton data-id='deny' variant={denyButton.variant || 'secondary'} onClick={onDeny}>
            {denyButton.text}
          </FooterButton>
        </Footer>
      </Container>
    </Modal>
  );
};

export { WarningModal, type WarningModalProps };
