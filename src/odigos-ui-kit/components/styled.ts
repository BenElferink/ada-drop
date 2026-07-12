import styled, { type CSSProperties } from 'styled-components';

export const FlexRow = styled.div<{ $gap?: number }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ $gap = 2 }) => $gap}px;
`;

export const FlexColumn = styled.div<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 2 }) => $gap}px;
`;

export const CenterThis = styled(FlexColumn)`
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const VerticalScroll = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow-y: scroll;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1px);
`;

// note: add-destinations does not use this (yet), because it has a custom sidebar
export const ModalBody = styled.div<{ $isNotModal?: boolean; $minHeight?: CSSProperties['minHeight'] }>`
  width: 640px;
  min-height: ${({ $minHeight }) => $minHeight || 'unset'};
  height: ${({ $isNotModal }) => ($isNotModal ? 'fit-content' : 'calc(100vh - 350px)')};
  margin: ${({ $isNotModal }) => ($isNotModal ? '64px 0 0 0' : '64px 7vw 32px 7vw')};
  padding: 0 2px;
  overflow-y: scroll;
`;

// common styles for focused-table containers
export const TableContainer = styled(FlexColumn)<{ $maxWidth: CSSProperties['maxWidth'] }>`
  max-width: ${({ $maxWidth }) => $maxWidth || 'unset'};
  width: 100%;
`;

export const TableTitleWrap = styled(FlexRow)`
  gap: 16px;
  padding: 16px;
`;

export const TableWrap = styled.div<{ $maxHeight: CSSProperties['maxHeight'] }>`
  width: 100%;
  max-height: ${({ $maxHeight }) => $maxHeight || 'unset'};
  overflow-y: auto;
`;
