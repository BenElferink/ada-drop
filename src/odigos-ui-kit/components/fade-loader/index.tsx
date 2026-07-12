import React, { type CSSProperties, type DetailedHTMLProps, type FC, type HTMLAttributes } from 'react';
import Theme from '@odigos/ui-kit/theme';
import { createAnimation } from './helpers/animation';
import { cssValue, parseLengthAndUnit } from './helpers/unitConverter';

interface FadeLoaderProps extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  loading?: boolean;
  color?: string;
  scale?: number;
  speedMultiplier?: number;
  cssOverride?: CSSProperties;
}

const fade = createAnimation('FadeLoader', '50% {opacity: 0.3} 100% {opacity: 1}', 'fade');

const FadeLoader: FC<FadeLoaderProps> = ({ loading = true, color: clr, scale = 1, speedMultiplier = 1, cssOverride = {}, style = {}, ...additionalprops }) => {
  const theme = Theme.useTheme();
  const color = clr || theme.text.secondary;

  if (!loading) return null;

  const { value } = parseLengthAndUnit(2);
  const radiusValue = value + 4.2;
  const quarter = radiusValue / 2 + radiusValue / 5.5;
  const widthAndHeight = radiusValue * 4 * scale;

  const wrapper: CSSProperties = {
    position: 'relative',
    width: `${widthAndHeight}px`,
    height: `${widthAndHeight}px`,
    scale,
    ...style,
    ...cssOverride,
  };

  const styles = (i: number, r: number): CSSProperties => {
    return {
      position: 'absolute',
      width: cssValue(1.5),
      height: cssValue(4),
      borderRadius: cssValue(2),
      backgroundColor: color,
      transition: '2s',
      animationFillMode: 'both',
      animation: `${fade} ${1.2 / speedMultiplier}s ${i * 0.12}s infinite ease-in-out`,
      transform: `translate(-50%, -50%) rotate(${r}deg)`,
    };
  };

  return (
    <span style={wrapper} {...additionalprops}>
      <span
        style={{
          ...styles(1, 0),
          top: `calc(50% + ${radiusValue}px)`,
          left: '50%',
        }}
      />
      <span
        style={{
          ...styles(2, -45),
          top: `calc(50% + ${quarter}px)`,
          left: `calc(50% + ${quarter}px)`,
        }}
      />
      <span
        style={{
          ...styles(3, 90),
          top: '50%',
          left: `calc(50% + ${radiusValue}px)`,
        }}
      />
      <span
        style={{
          ...styles(4, 45),
          top: `calc(50% + ${-1 * quarter}px)`,
          left: `calc(50% + ${quarter}px)`,
        }}
      />
      <span
        style={{
          ...styles(5, 0),
          top: `calc(50% + ${-1 * radiusValue}px)`,
          left: '50%',
        }}
      />
      <span
        style={{
          ...styles(6, -45),
          top: `calc(50% + ${-1 * quarter}px)`,
          left: `calc(50% + ${-1 * quarter}px)`,
        }}
      />
      <span
        style={{
          ...styles(7, 90),
          top: '50%',
          left: `calc(50% + ${-1 * radiusValue}px)`,
        }}
      />
      <span
        style={{
          ...styles(8, 45),
          top: `calc(50% + ${quarter}px)`,
          left: `calc(50% + ${-1 * quarter}px)`,
        }}
      />
    </span>
  );
};

export { FadeLoader, type FadeLoaderProps };
