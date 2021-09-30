import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
} from '@material-ui/core';

const AppHeader = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        The Jedi Council
      </Typography>
      <Button color="inherit" component={Link} to="/">Home</Button>
      <Button color="inherit" component={Link} to="/members">Member Manager</Button>
    </Toolbar>
  </AppBar>
);

export default AppHeader;