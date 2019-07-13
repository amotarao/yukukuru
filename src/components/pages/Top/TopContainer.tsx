import React, { useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { UserContainer } from '../../../stores/user';
import { Top, TopProps } from './';

interface Props extends RouteComponentProps, Partial<TopProps> {}

const TopContainer: React.FC<Props> = ({ history }) => {
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
      }}
    />
  );
};

const TopContainerWithRouter = withRouter(TopContainer);

export { TopContainerWithRouter as TopContainer };
