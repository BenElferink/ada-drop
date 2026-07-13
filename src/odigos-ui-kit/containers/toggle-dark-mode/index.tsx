import React, { type FC } from 'react';
import { useDarkMode } from '@odigos/ui-kit/store';
import styled from 'styled-components';

interface ToggleDarkModeProps {}

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: fit-content;
  padding: 6px;
  gap: 6px;
  border-radius: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.secondary};
  }
  & > svg {
    cursor: pointer;
    z-index: 1;
    & > path {
      stroke: ${({ theme }) => theme.text.secondary};
    }
  }
`;

const Background = styled.div<{ $darkMode: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $darkMode }) => ($darkMode ? '2px' : 'calc(100% - 2px - 24px)')};
  z-index: 0;
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 100%;
  transition: all 0.3s;
`;

const Svg: FC<{ path: string }> = ({ path }) => {
  return (
    <svg width={16} height={16} viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='none'>
      <path strokeLinecap='round' strokeLinejoin='round' d={path} />
    </svg>
  );
};

const ToggleDarkMode: FC<ToggleDarkModeProps> = () => {
  const { darkMode, setDarkMode } = useDarkMode();

  return (
    <Container onClick={() => setDarkMode(!darkMode)}>
      {/* MoonIcon copied from @/icons to prevent dependency installation */}
      <Svg path='M14 7.977A4.333 4.333 0 1 1 8.023 2H8a6 6 0 1 0 6 6v-.023Z' />

      {/* SunIcon copied from @/icons to prevent dependency installation */}
      <Svg path='M8 15.333v-.666m-5.185-1.482.471-.471M.666 8h.667m1.482-5.185.471.47M8 1.334V.667m4.714 2.619.471-.471M14.667 8h.666m-2.619 4.714.471.471M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' />

      <Background $darkMode={darkMode} />
    </Container>
  );
};

export { ToggleDarkMode, type ToggleDarkModeProps };
