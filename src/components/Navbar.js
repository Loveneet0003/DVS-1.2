import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    marginLeft: theme.spacing(2),
  },
}));

function Navbar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            College Election System
          </Typography>
          <Link to="/" className={classes.link}>
            <Button color="inherit">Home</Button>
          </Link>
          <Link to="/register" className={classes.link}>
            <Button color="inherit">Register</Button>
          </Link>
          <Link to="/vote" className={classes.link}>
            <Button color="inherit">Vote</Button>
          </Link>
          <Link to="/results" className={classes.link}>
            <Button color="inherit">Live Results</Button>
          </Link>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navbar; 