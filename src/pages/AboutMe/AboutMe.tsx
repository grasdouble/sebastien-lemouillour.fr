import React from 'react';
import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import Layout from 'layouts';

import GithubActivity from './GithubActivity';
import LogbookEntry from './LogbookEntry';

import { typoH1Props, typoTextProps } from 'utils/typoProps';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      marginBottom: '20px',
    },
  }),
);

const AboutMe: React.FunctionComponent = () => {
  const classes = useStyles();

  const nbXp = new Date().getFullYear() - 2007;

  return (
    <Layout>
      <Grid container spacing={6}>
        <Grid key="description" item xs={12}>
          <Typography {...typoH1Props}>About Me</Typography>
          <Divider className={classes.divider} />
          <Typography {...typoTextProps}>
            Developer since approximatively <b>{nbXp} years</b>, I started to
            develop on backend side and after <b>8 years to work with Java</b>
            , I decide to change to work more on frontend activities. <br />
          </Typography>
          <Typography {...typoTextProps}>
            <b>Since 2015</b>, I'm working on different frontend projects
            (firstly with <b>Angular</b> and after with <b>ReactJS</b> as
            framework).
          </Typography>
          <Typography {...typoTextProps}>
            I'm currently <b>Principal Frontend Engineer</b> at Talend where I
            have the opportunity to continue to increase my skills and to share
            my knowledges with others.
          </Typography>
          <Divider className={classes.divider} />
        </Grid>
        <Grid key="logbook" item xs={12} md={6} lg={6}>
          <LogbookEntry />
        </Grid>
        <Grid key="github" item xs={12} md={6} lg={6}>
          <GithubActivity />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default AboutMe;
