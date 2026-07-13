import React, { type DetailedHTMLProps, type HTMLAttributes, type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import type { IStyledComponentBase, Substitute, Keyframes } from 'styled-components/dist/types';

interface HookProps {
  container: IStyledComponentBase<'web', Substitute<DetailedHTMLProps<HTMLAttributes<any>, any>, any>> & string;
  animateIn: Keyframes;
  animateOut?: Keyframes;
  duration?: number; // in milliseconds
}

type TransitionProps = PropsWithChildren<{
  enter: boolean;
  [key: string]: any;
}>;

const useTransition = ({ container, animateIn, animateOut, duration = 300 }: HookProps) => {
  const Animated = styled(container)<{ $isEntering: boolean; $isLeaving: boolean }>`
    animation-name: ${({ $isEntering, $isLeaving }) => ($isEntering ? animateIn : $isLeaving ? animateOut : 'none')};
    animation-duration: ${duration}ms;
    animation-fill-mode: forwards;
  `;

  // !! Do not deprecate this "useCallback" hook, it is necessary for the transition to work properly
  const Transition = useCallback(
    ({ children, enter, ...props }: TransitionProps) => {
      const [mounted, setMounted] = useState(false);

      useEffect(() => {
        const t = setTimeout(() => setMounted(enter), duration + 50); // +50ms to ensure the animation is finished
        return () => clearTimeout(t);
      }, [enter, duration]);

      if (!enter && !mounted) return null;

      return (
        <Animated $isEntering={enter} $isLeaving={!enter && mounted} {...props}>
          {children}
        </Animated>
      );
    },
    // !! Do not add dependencies here, it will cause re-renders which we want to avoid
    [],
  );

  return Transition;
};

export { useTransition };
