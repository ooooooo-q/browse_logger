import React from 'react';
import {
  List, Datagrid, Edit, Create, SimpleForm,
  UrlField, Filter,
  DateField, TextField, DisabledInput,
  TextInput, LongTextInput, DateInput,
  EditButton
} from 'admin-on-rest';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
} from 'material-ui/Card';

import FlatButton from 'material-ui/FlatButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';

import _LogIcon from 'material-ui/svg-icons/action/book';
export const LogIcon = _LogIcon;


const LogPagination = ({ page, perPage, total, setPage }) => {
  return (
    <Toolbar>
      <div onMouseOver={() => setPage(page - 1)} >next .. ↓</div>
    </Toolbar>
  );
};

const LogFilter = (props) => (
  <Filter {...props}>
    <TextInput label="sec" source="durationSec" defaultValue={10} alwaysOn />
  </Filter>
);


const cardStyle = {
  width: 300,
  minHeight: 300,
  margin: '0.5em',
  display: 'inline-block',
  verticalAlign: 'top',
  wordBreak: 'break-all',
};
const LogGrid = ({ ids, data, basePath }) => (
  <div style={{ margin: '1em' }}>
    {ids.map(id =>
      <Card key={id} style={cardStyle}>
        <CardHeader
          title={<TextField record={data[id]} source="title" />}
          subtitle={ <DateField record={data[id]} source="timestamp" options={{
              month: 'numeric', day: 'numeric',
              hour: 'numeric', minute: 'numeric',
              hour12: false
              }}/>}

        />
        <CardText>
          <UrlField record={data[id]} source="url" />
          <TextField record={data[id]} source="duration_sec" />
        </CardText>
      </Card>
    )}
  </div>
);
LogGrid.defaultProps = {
  data: {},
  ids: []
};

export const LogList = (props) => (
  <List {...props}  pagination={<LogPagination />} filters={<LogFilter />}>
    <LogGrid />
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