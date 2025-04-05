import React from 'react';
import { Container, Paper, Typography, Button, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';
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
  hero: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  button: {
    margin: theme.spacing(2),
  },
  feature: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
}));

function Home() {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="md" className={classes.container}>
      <Paper className={classes.paper}>
        <div className={classes.hero}>
          <Typography component="h1" variant="h3" gutterBottom>
            College Election System
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            A secure and transparent voting platform powered by blockchain technology
          </Typography>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper className={classes.feature}>
              <Typography variant="h6" gutterBottom>
                Secure Registration
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Register with your college email to participate in the election
              </Typography>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Register Now
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className={classes.feature}>
              <Typography variant="h6" gutterBottom>
                Cast Your Vote
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Vote for your preferred candidate securely
              </Typography>
              <Button
                component={Link}
                to="/vote"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Vote Now
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className={classes.feature}>
              <Typography variant="h6" gutterBottom>
                Live Results
              </Typography>
              <Typography variant="body2" color="textSecondary">
                View real-time voting results
              </Typography>
              <Button
                component={Link}
                to="/results"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                View Results
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Home; 