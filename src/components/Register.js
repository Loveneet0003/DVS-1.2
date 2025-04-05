import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Register() {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if email contains @college.edu
    if (email.includes('@college.edu')) {
      // Store the verified email in localStorage
      localStorage.setItem('verifiedEmail', email);
      setSnackbarMessage('Registration successful! You can now vote.');
      setSeverity('success');
    } else {
      setSnackbarMessage('Please use a valid college email address (@college.edu)');
      setSeverity('error');
    }
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" className={classes.container}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h5">
          Register to Vote
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="College Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Register
          </Button>
        </form>
      </Paper>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Register; 