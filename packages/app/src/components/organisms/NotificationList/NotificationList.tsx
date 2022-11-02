import LinkIcon from '@mui/icons-material/Link';

interface NotificationItem {
  name: string;
  text: string;
  url: string;
}

export const NotificationList: React.FC = () => {
  const items: NotificationItem[] = [
    {
      name: 'ゆくくる運営',
      text: 'データが正常に表示されていないなどのお問い合わせは、Twitterからリプライ・DMにてお知らせください\nTwitterはこちら',
      url: 'https://twitter.com/yukukuruapp',
    },
  ];

  return (
    <ul className="list-none">
      {items.map((item, i) => (
        <li className="border-b border-back-2" key={i}>
          <a
            className="block p-[1rem] text-inherit no-underline"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="mb-[0.5rem]">{item.name}</p>
            <p className="whitespace-pre-line text-[0.8rem] [&_svg]:ml-[2em] [&_svg]:align-middle [&_svg]:text-[1em] [&_svg]:text-sub">
              {item.text}
              <LinkIcon />
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
};
