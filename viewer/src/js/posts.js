import React from 'react';
import {
  List, Datagrid, Edit, Create, SimpleForm,
  UrlField,
  DateField, TextField, DisabledInput,
  TextInput, LongTextInput, DateInput
} from 'admin-on-rest';

import FlatButton from 'material-ui/FlatButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';

import _PostIcon from 'material-ui/svg-icons/action/book';
export const PostIcon = _PostIcon;


const PostPagination = ({ page, perPage, total, setPage }) => {
  return (
    <Toolbar>
      <ToolbarGroup>
        <FlatButton primary key="prev" label="Prev" icon={<ChevronLeft />} onClick={() => setPage(page - 1)} />
        <FlatButton primary key="next" label="Next" icon={<ChevronRight />} onClick={() => setPage(page + 1)} labelPosition="before" />
      </ToolbarGroup>
    </Toolbar>
  );
};


export const PostList = (props) => (
  <List {...props}  pagination={<PostPagination />}>
    <Datagrid>
      <DateField source="timestamp" options={{
        month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric',
        hour12: false
      }}/>
      <TextField source="title" />
      <UrlField source="url" />
      <TextField source="duration_sec" />
    </Datagrid>
  </List>
);

const PostTitle = ({ record }) => {
  return <span>Post {record ? `"${record.title}"` : ''}</span>;
};

export const PostEdit = (props) => (
  <Edit title={<PostTitle />} {...props}>
    <SimpleForm>
      <DisabledInput source="id" />
      <TextInput source="title" />
      <TextInput source="teaser" options={{ multiLine: true }} />
      <LongTextInput source="body" />
      <DateInput label="Publication date" source="published_at" />
      <TextInput source="average_note" />
      <DisabledInput label="Nb views" source="views" />
    </SimpleForm>
  </Edit>
);

export const PostCreate = (props) => (
  <Create title="Create a Post" {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="teaser" options={{ multiLine: true }} />
      <LongTextInput source="body" />
      <TextInput label="Publication date" source="published_at" />
      <TextInput source="average_note" />
    </SimpleForm>
  </Create>
);