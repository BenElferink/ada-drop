import { useEffect, useState, useRef } from 'react';

const useContainerSize = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const resize = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect();

        setWidth(width);
        setHeight(height);
      }
    };

    resize();

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return {
    containerRef: ref,
    containerWidth: width,
    containerHeight: height,
  };
};

export { useContainerSize };
