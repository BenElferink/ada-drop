import React from 'react';
import Theme from '@odigos/ui-kit/theme';
import type { SVG } from '@odigos/ui-kit/types';

export const SortArrowsIcon: SVG = ({ size = 16, fill: f, rotate = 0, onClick }) => {
  const theme = Theme.useTheme();
  const fill = f || theme.text.secondary;

  return (
    <svg width={size} height={size * (24 / 25)} viewBox='0 0 25 24' xmlns='http://www.w3.org/2000/svg' fill='none' style={{ transform: `rotate(${rotate}deg)` }} onClick={onClick}>
      <path
        stroke={fill}
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M16.5 9C15.4379 7.53812 14.1929 6.22872 12.7979 5.1058C12.6226 4.96473 12.3774 4.96473 12.2021 5.1058C10.8071 6.22872 9.56206 7.53812 8.5 9M8.5 15C9.56206 16.4619 10.8071 17.7713 12.2021 18.8942C12.3774 19.0353 12.6226 19.0353 12.7979 18.8942C14.1929 17.7713 15.4379 16.4619 16.5 15'
      />
    </svg>
  );
};
