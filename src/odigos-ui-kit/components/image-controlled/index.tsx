import React, { type FC, useState } from 'react';
import { ImageErrorIcon } from '@odigos/ui-kit/icons';

interface ImageControlledProps {
  src: string;
  alt?: string;
  size?: number;
}

const ImageControlled: FC<ImageControlledProps> = ({ src = '', alt = '', size = 16 }) => {
  const [hasError, setHasError] = useState(false);

  if (!!src && !hasError) {
    return <img src={src} alt={alt} width={size} height={size} onError={() => setHasError(true)} />;
  }

  return <ImageErrorIcon size={size} />;
};

export { ImageControlled, type ImageControlledProps };
