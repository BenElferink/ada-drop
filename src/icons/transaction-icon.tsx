import React from 'react'
import Theme from '@odigos/ui-kit/theme'
import type { SVG } from '@odigos/ui-kit/types'

export const TransactionIcon: SVG = ({ size = 16, fill: f, rotate = 0, onClick }) => {
  const theme = Theme.useTheme()
  const fill = f || theme.text.secondary

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      style={{ transform: `rotate(${rotate}deg)` }}
      onClick={onClick}
    >
      <path
        stroke={fill}
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M21 4.5C20.7944 3.63739 20.0694 3 19.2065 3L18 3M15 9.5C15.2056 10.3626 15.9306 11 16.7935 11H18M18 3L16.8519 3C15.8291 3 15 3.89543 15 5C15 6.10457 15.8291 7 16.8519 7L19.1481 7C20.1709 7 21 7.89543 21 9C21 10.1046 20.1709 11 19.1481 11H18M18 3V2M18 11V12M5.07031 8C6.29534 5.88228 8.46326 4.37823 11 4.06189M18.9298 16C17.7048 18.1177 15.5368 19.6218 13.0001 19.9381M3 17H7M3 17V13H7C8.10457 13 9 13.8954 9 15C9 16.1046 8.10457 17 7 17M3 17V21H7C8.10457 21 9 20.1046 9 19C9 17.8954 8.10457 17 7 17M6 21V22M6 12V13'
      />
    </svg>
  )
}
