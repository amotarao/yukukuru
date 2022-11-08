import classNames from 'classnames';

const icons = {
  home: {
    size: 24,
    path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  },
  cog: {
    size: 24,
    path: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  },
  arrow_down: {
    size: 24,
    path: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  },
  check_circle: {
    size: 24,
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  },
  cross: {
    size: 48,
    path: 'm12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z',
  },
  membership: {
    size: 48,
    path: 'M7 25.85V31h34v-5.15ZM7 4h34q1.25 0 2.125.875T44 7v24q0 1.25-.875 2.125T41 34h-9.7v10L24 40.3 16.7 44V34H7q-1.25 0-2.125-.875T4 31V7q0-1.25.875-2.125T7 4Zm0 16.45h34V7H7ZM7 31V7v24Z',
  },
};

export type IconType = keyof typeof icons;

export type IconProps = {
  className?: string;
  type: IconType;
} & JSX.IntrinsicElements['svg'];

export const Icon: React.FC<IconProps> = ({ className, type, ...props }) => {
  const icon = icons[type];

  return (
    <svg
      className={classNames('where:h-[1em] where:w-[1em]', className)}
      viewBox={`0 0 ${icon.size} ${icon.size}`}
      {...props}
    >
      <path d={icon.path} fill="currentColor"></path>
    </svg>
  );
};
