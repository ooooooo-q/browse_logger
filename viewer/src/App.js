import React, { Component } from 'react';
import './App.css';

import { Admin, Resource } from 'admin-on-rest';

import { PostList, PostEdit, PostCreate, PostIcon } from './js/posts';
import restClient from "./js/rest_client";
import authClient from "./js/auth_client";


class App extends Component {
  render() {
    return (
      <Admin restClient={restClient()} authClient={authClient}>
        <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon}/>
      </Admin>
    );
  }
}

export default App;
