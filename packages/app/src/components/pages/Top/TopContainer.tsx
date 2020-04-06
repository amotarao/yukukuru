import React, { useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { ThemeContainer } from '../../../stores/theme';
import { UserContainer } from '../../../stores/user';
import { Top, TopProps } from '.';

interface Props extends RouteComponentProps, Partial<TopProps> {}

const TopContainer: React.FC<Props> = ({ history }) => {
  const { theme } = ThemeContainer.useContainer();
  const { isLoading, signedIn, signIn } = UserContainer.useContainer();

  useEffect(() => {
    if (!isLoading && signedIn) {
      history.replace('/my');
    }
  }, [history, signedIn, isLoading]);

  return (
    <Top
      {...{
        isLoading,
        signIn,
        theme,
      }}
    />
  );
};

const TopContainerWithRouter = withRouter(TopContainer);

export { TopContainerWithRouter as TopContainer };
