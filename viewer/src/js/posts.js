import React from 'react';
import {
  List, Datagrid, Edit, Create, SimpleForm,
  UrlField,
  DateField, TextField, DisabledInput,
  TextInput, LongTextInput, DateInput
} from 'admin-on-rest';
import _PostIcon from 'material-ui/svg-icons/action/book';
export const PostIcon = _PostIcon;

export const PostList = (props) => (
  <List {...props}>
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