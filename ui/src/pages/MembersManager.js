import React, { Component, Fragment } from 'react';
import { withOktaAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Fab,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import MemberEditor from '../components/MemberEditor';
import ErrorSnackbar from '../components/ErrorSnackbar';

const styles = theme => ({
  members: {
    marginTop: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
});

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class MemberManager extends Component {
  state = {
    loading: true,
    members: [],
    error: null,
  };

  componentDidMount() {
    this.getMembers();
  }

  async fetch(method, endpoint, body) {
    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
        body: body && JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: `Bearer ${await this.props.authService.getAccessToken()}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error(error);

      this.setState({ error });
    }
  }

  async getMembers() {
    this.setState({ loading: false, members: (await this.fetch('get', '/members')) || [] });
  }

  saveMember = async (member) => {
    if (member.id) {
      await this.fetch('put', `/members/${member.id}`, member);
    } else {
      await this.fetch('post', '/members', member);
    }

    this.props.history.goBack();
    this.getMembers();
  }

  async deleteMember(member) {
    if (window.confirm(`Are you sure you want to delete "${member.name}"`)) {
      await this.fetch('delete', `/members/${member.id}`);
      this.getMembers();
    }
  }

  renderMemberEditor = ({ match: { params: { id } } }) => {
    if (this.state.loading) return null;
    const member = find(this.state.members, { id: Number(id) });

    if (!member && id !== 'new') return <Redirect to="/members" />;

    return <MemberEditor member={member} onSave={this.saveMember} />;
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h4">Members Manager</Typography>
        {this.state.members.length > 0 ? (
          <Paper elevation={1} className={classes.members}>
            <List>
              {orderBy(this.state.members, ['updatedAt', 'name'], ['desc', 'asc']).map(member => (
                <ListItem key={member.id} button component={Link} to={`/members/${member.id}`}>
                  <ListItemText
                    primary={member.name}
                    secondary={member.updatedAt && `Updated ${moment(member.updatedAt).fromNow()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => this.deleteMember(member)} color="inherit">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          !this.state.loading && <Typography variant="subtitle1">No members to display</Typography>
        )}
        <Fab
          color="secondary"
          aria-label="add"
          className={classes.fab}
          component={Link}
          to="/members/new"
        >
          <AddIcon />
        </Fab>
        <Route exact path="/members/:id" render={this.renderMemberEditor} />
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={this.state.error.message}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(
  withOktaAuth,
  withRouter,
  withStyles(styles),
)(MemberManager);