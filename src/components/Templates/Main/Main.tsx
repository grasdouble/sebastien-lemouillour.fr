import React from "react";
import clsx from "clsx";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import LinkedInIcon from "@material-ui/icons/LinkedIn";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import CodeIcon from "@material-ui/icons/Code";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    toolbar: {
      ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(0),
      [theme.breakpoints.up("md")]: {
        marginLeft: theme.spacing(9),
        marginRight: theme.spacing(9),
      },
    },
    gridMain: {
      flexGrow: 1,
    },
    gridLeftPane: {},
    links: {
      [theme.breakpoints.down("sm")]: {
        paddingLeft: theme.spacing(2),
        marginTop: "auto",
        marginBottom: "auto",
      },
      [theme.breakpoints.up("md")]: {
        marginTop: theme.spacing(2),
      },
    },
    avatar: {
      border: "5px solid",
      [theme.breakpoints.down("sm")]: {
        margin: theme.spacing(1),
        width: theme.spacing(15),
        height: theme.spacing(15),
      },
      [theme.breakpoints.up("md")]: {
        width: theme.spacing(20),
        height: theme.spacing(20),
      },
    },
  })
);

const Main: React.FunctionComponent = (props) => {
  const classes = useStyles();

  return (
    <main className={clsx(classes.content)}>
      <div className={classes.toolbar} />
      <Container maxWidth={false}>
        <Grid
          container
          className={classes.gridMain}
          justify="center"
          spacing={5}
        >
          <Grid key="leftPane" item sm={12} md={3} lg={2}>
            <Grid container className={classes.gridLeftPane} justify="center">
              <Grid key="avatar" item>
                <Avatar
                  alt="Sebastien Le Mouillour"
                  className={classes.avatar}
                  src="/img/avatar.jfif"
                >
                  Sébastien
                  <br />
                  LE MOUILLOUR
                </Avatar>
              </Grid>
              <Grid key="links" className={classes.links} item>
                <Box textAlign="center">
                  <Box textAlign="left">
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<LinkedInIcon fontSize="large" />}
                      target="_blank"
                      href="https://www.linkedin.com/in/sebastienlemouillour/"
                    >
                      LinkedIn
                    </Button>
                  </Box>
                  <Box textAlign="left" mt={1}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<CodeIcon fontSize="large" />}
                      target="_blank"
                      href="https://leetcode.com/smouillour/"
                    >
                      LeetCode
                    </Button>
                  </Box>
                  <Box textAlign="left" mt={1}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<AlternateEmailIcon fontSize="large" />}
                      target="_blank"
                      href="mailto:sebastien.lemouillour@gmail.com"
                    >
                      Contact Me
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid key="content" item sm={12} md={9} lg={10}>
            {props.children}
          </Grid>
        </Grid>
      </Container>
    </main>
  );
};

export default Main;
