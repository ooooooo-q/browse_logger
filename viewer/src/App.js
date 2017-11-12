import React, { Component } from 'react';
import './App.css';

import { Admin, Resource } from 'admin-on-rest';

import { PostList, PostEdit, PostCreate, PostIcon } from './js/posts';
import apiClient from "./js/api_client";


class App extends Component {
  render() {
    return (
      <Admin restClient={apiClient('http://localhost:3000')}>
        <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon}/>
      </Admin>
    );
  }
}

export default App;
