/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';

const fallbackImage = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';

export type TwitterUserIconProps = React.HTMLProps<HTMLImageElement>;

export const TwitterUserIcon: React.FC<TwitterUserIconProps> = (props) => {
  const [src, setSrc] = useState<TwitterUserIconProps['src']>(props.src);

  const onError = () => {
    setSrc(fallbackImage);
  };

  return <img {...props} src={src} alt={props.alt} crossOrigin="anonymous" onError={onError} />;
};
