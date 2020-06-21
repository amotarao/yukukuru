/** @jsx jsx */
import { jsx } from '@emotion/core';
import LinkIcon from '@material-ui/icons/Link';
import { style } from './style';

interface NotificationItem {
  name: string;
  text: string;
  url: string;
}

export const NotificationList: React.FC = () => {
  const items: NotificationItem[] = [
    {
      name: 'ゆくくる運営',
      text:
        'データが正常に表示されていないなどのお問い合わせは、Twitterからリプライ・DMにてお知らせください\nTwitterはこちら',
      url: 'https://twitter.com/yukukuruapp',
    },
  ];

  return (
    <ul css={style.list}>
      {items.map((item, i) => (
        <li css={style.item} key={i}>
          <a css={style.card} href={item.url} target="_blank" rel="noopener noreferrer">
            <p css={style.name}>{item.name}</p>
            <p css={style.text}>
              {item.text}
              <LinkIcon />
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
};
