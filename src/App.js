import React from 'react';
import { Provider } from 'react-redux';
import store from './app/store';
import Navbar from 'react-bootstrap/Navbar';
import Logo from './imgs/FundBoard_Logo.svg';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import Investor from './app/pages/investor/Investor';

// import common icons so they're accessible later.
library.add(
  faTimes,
);

function App() {
  return (
    <Provider store={store}>
      <Navbar className="nav">
        <a href="/" className="navBrand">
          <img className="navLogo" src={Logo} alt="FundBoard Logo" />
          <span className="navName">FundBoard</span>
          <span className="navVersion">Investor Data Retriever Alpha 0.11</span>
        </a>
      </Navbar>
      <main id="Main">
        <div className="container-xl">
          <Investor />
        </div>
      </main>
    </Provider>
  );
}

export default App;
