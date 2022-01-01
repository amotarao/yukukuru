import classNames from 'classnames';
import React, { useState } from 'react';

export type TwitterUserIconProps = {
  className?: string;
  src?: string;
};

export const TwitterUserIcon: React.FC<TwitterUserIconProps> = ({ className, src }) => {
  const [error, setError] = useState(false);
  const image = error ? 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png' : src || '';

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className={classNames('rounded-full', className)}
      src={image}
      alt=""
      loading="lazy"
      onError={() => {
        setError(true);
      }}
    />
  );
};
