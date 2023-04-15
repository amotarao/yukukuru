import classNames from 'classnames';
import { Share } from 'react-twitter-widgets';

interface TweetButtonProps {
  className?: string;
  size?: 'normal' | 'large';
}

export const TweetButton: React.FC<TweetButtonProps> = ({ className, size = 'normal' }) => {
  const isNormal = size === 'normal';

  return (
    <div
      className={classNames(className, isNormal ? 'h-[20px]' : 'h-[28px]', '[&_iframe]:block')}
      data-size={isNormal ? undefined : size}
    >
      <Share
        url="https://yukukuru.app"
        options={{
          text: 'ゆくくる - Twitterのフォロワーがいつきたか・いなくなったかを記録します',
          size: isNormal ? undefined : size,
          via: 'yukukuruapp',
          hashtags: 'ゆくくる',
          lang: 'ja',
          showCount: false,
        }}
      />
    </div>
  );
};
