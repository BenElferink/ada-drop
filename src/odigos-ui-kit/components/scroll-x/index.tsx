import React, { useEffect, useRef, useState, type FC } from 'react';
import { FlexRow } from '../styled';
import { Tooltip } from '../tooltip';
import styled from 'styled-components';
import { Text, type TextProps } from '../text';

interface ScrollXProps {
  maxWidth: number;
  text: string;
  textSize?: TextProps['size'];
  textColor?: TextProps['color'];
}

const LimitedText = styled(Text)<{ $maxWidth?: number }>`
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : 'unset')};
  white-space: nowrap;
  overflow-x: auto;

  &::after {
    // This is to prevent the "browser default tooltip" from appearing when the title is too long
    content: '';
    display: block;
  }
`;

const ScrollX: FC<ScrollXProps> = ({ maxWidth, text, textSize = 16, textColor }) => {
  const [isOverflowed, setIsOverflowed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Check if text is overflowed from maximum width
  useEffect(() => {
    if (ref.current) {
      const { clientWidth } = ref.current;
      const marginUp = (maxWidth - textSize) * 1.05; // add 5%
      const marginDown = (maxWidth - textSize) * 0.95; // subtract 5%

      setIsOverflowed(clientWidth < marginUp && clientWidth > marginDown);
    }
  }, [maxWidth, textSize, text]);

  return (
    <FlexRow $gap={0}>
      {text && (
        <Tooltip text={isOverflowed ? text : undefined}>
          <LimitedText ref={ref} $maxWidth={maxWidth - textSize} size={textSize} color={textColor}>
            {text}
          </LimitedText>
        </Tooltip>
      )}

      {isOverflowed && (
        <LimitedText $maxWidth={textSize} size={textSize} color={textColor}>
          ...
        </LimitedText>
      )}
    </FlexRow>
  );
};

export { ScrollX, type ScrollXProps };
