import { ThemeContainer } from '../../../store/theme';
import { ThemeSwitchButton } from '.';

type Props = {
  children?: React.ReactNode;
};

export const ThemeSwitchButtonContainer: React.FC<Props> = ({ children }) => {
  const { theme, setTheme } = ThemeContainer.useContainer();

  return (
    <ThemeSwitchButton
      {...{
        children,
        theme,
        setTheme,
      }}
    />
  );
};
