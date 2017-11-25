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

import _LogIcon from 'material-ui/svg-icons/action/book';
export const LogIcon = _LogIcon;


const LogPagination = ({ page, perPage, total, setPage }) => {
  return (
    <Toolbar>
      <ToolbarGroup>
        <FlatButton primary key="prev" label="Prev" icon={<ChevronLeft />} onClick={() => setPage(page - 1)} />
        <FlatButton primary key="next" label="Next" icon={<ChevronRight />} onClick={() => setPage(page + 1)} labelPosition="before" />
      </ToolbarGroup>
    </Toolbar>
  );
};


export const LogList = (props) => (
  <List {...props}  pagination={<LogPagination />}>
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

const LogTitle = ({ record }) => {
  return <span>Log {record ? `"${record.title}"` : ''}</span>;
};

export const LogEdit = (props) => (
  <Edit title={<LogTitle />} {...props}>
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

export const LogCreate = (props) => (
  <Create title="Create a Log" {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="teaser" options={{ multiLine: true }} />
      <LongTextInput source="body" />
      <TextInput label="Publication date" source="published_at" />
      <TextInput source="average_note" />
    </SimpleForm>
  </Create>
);