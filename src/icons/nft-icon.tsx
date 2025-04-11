import React from 'react'
import Theme from '@odigos/ui-kit/theme'
import type { SVG } from '@odigos/ui-kit/types'

export const NftIcon: SVG = ({ size = 16, fill: f, rotate = 0, onClick }) => {
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
        d='M21.3594 11H19.0372C18.1022 11 17.6347 11 17.2405 11.0342C12.8595 11.4149 9.38614 14.8646 9.00286 19.2156C8.96882 19.602 8.96838 20.0595 8.96837 20.9645M21.3594 11C21.2082 10.4811 20.9015 9.9329 20.3544 8.95471L18.8648 6.29189C18.1946 5.09379 17.8596 4.49474 17.3829 4.05853C16.9613 3.67263 16.4616 3.38059 15.9171 3.20194C15.3017 3 14.6117 3 13.2317 3L10.7463 3C9.3663 3 8.6763 3 8.0609 3.20194C7.51647 3.38059 7.01673 3.67263 6.59509 4.05853C6.11848 4.49474 5.78339 5.09379 5.1132 6.29189L3.65881 8.89189C3.02425 10.0263 2.70696 10.5935 2.58257 11.1942C2.47248 11.7258 2.47248 12.2742 2.58257 12.8058C2.70696 13.4065 3.02425 13.9737 3.65882 15.1081L5.1132 17.7081C5.78339 18.9062 6.11848 19.5053 6.59509 19.9415C7.01673 20.3274 7.51647 20.6194 8.0609 20.7981C8.33152 20.8869 8.61657 20.9366 8.96837 20.9645M21.3594 11C21.3802 11.0713 21.398 11.142 21.4132 11.2132C21.5241 11.7352 21.5288 12.2739 21.4269 12.7977C21.3119 13.3895 21.0104 13.951 20.4075 15.074L19.9103 16L18.8805 17.7837C18.2041 18.9552 17.8658 19.541 17.3913 19.9671C16.9715 20.3441 16.4763 20.629 15.9382 20.8031C15.33 21 14.6501 21 13.2903 21H10.7463C9.97316 21 9.41659 21 8.96837 20.9645M8.96837 10C8.41229 10 7.96149 9.55228 7.96149 9C7.96149 8.44772 8.41229 8 8.96837 8C9.52446 8 9.97526 8.44772 9.97526 9C9.97526 9.55228 9.52446 10 8.96837 10Z'
      />
    </svg>
  )
}
