import React, { type FC, type PropsWithChildren } from 'react';
import { useDarkMode } from '@odigos/ui-kit/store';
import { getTheme } from '../palletes';
import { ThemeProvider } from 'styled-components';
import './globals.css';

export const Provider: FC<PropsWithChildren> = ({ children }) => {
  const { darkMode } = useDarkMode();

  return <ThemeProvider theme={getTheme(darkMode)}>{children}</ThemeProvider>;
};
