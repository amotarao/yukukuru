import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { TopContainer } from './components/pages/Top';
import { MyContainer } from './components/pages/My';
import { GlobalStyle } from './constants/GlobalStyle';
import { UserContainer } from './stores/user';

const App: React.FC = () => (
  <UserContainer.Provider>
    <GlobalStyle />
    <Router>
      <Route path="/" exact component={TopContainer} />
      <Route path="/my" component={MyContainer} />
    </Router>
  </UserContainer.Provider>
);

export default App;
