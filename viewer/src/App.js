import React, { Component } from 'react';
import './App.css';

import { Admin, Resource } from 'admin-on-rest';

import { LogList, LogEdit, LogCreate, LogIcon } from './js/logs';
import restClient from "./js/rest_client";
import authClient from "./js/auth_client";


class App extends Component {
  render() {
    return (
      <Admin restClient={restClient()} authClient={authClient}>
        <Resource name="Logs" list={LogList} edit={LogEdit} create={LogCreate} icon={LogIcon}/>
      </Admin>
    );
  }
}

export default App;
