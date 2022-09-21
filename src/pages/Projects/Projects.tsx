import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

import Layout from 'layouts';
import { ProjectInfo } from 'routes';
import { typoH1Props } from 'utils/typoProps';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    markdown: {
      '& img': {
        maxWidth: '80vw',
      },
    },
    divider: {
      marginBottom: '20px',
    },
    inline: {
      textDecoration: 'underline',
    },
  }),
);

type ProjectProps = {
  projectInfo?: ProjectInfo;
};

type fetchState = {
  isLoading: boolean;
  content: string | undefined;
};

const Projects: React.FunctionComponent<ProjectProps> = ({ projectInfo }) => {
  const classes = useStyles();

  const [data, setData] = useState<fetchState>({
    isLoading: false,
    content: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      setData({ isLoading: true, content: undefined });
      let text = '';
      if (projectInfo) {
        const res = await fetch(
          `https://raw.githubusercontent.com/${projectInfo.readmePath}`,
        );
        text = await res.text();
      }
      setData({ isLoading: false, content: text });
    };
    fetchData();
  }, [setData, projectInfo]);

  return (
    <Layout>
      {data.isLoading ? (
        <div>Loading ...</div>
      ) : (
        projectInfo && (
          <Grid container spacing={5}>
            <Grid key="info" item sm={12} md={4} lg={4}>
              <Typography {...typoH1Props}>Info</Typography>
              <Divider className={classes.divider} />
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                Start date:
              </Typography>{' '}
              {projectInfo.startDate}
              <br />
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                Github:
              </Typography>{' '}
              <Link href={projectInfo.githubUrl}>
                {projectInfo.githubUrl.replace('https://github.com/', '')}
              </Link>
              <br />
            </Grid>
            <Grid key="readme" item sm={12} md={8} lg={8}>
              <Typography {...typoH1Props}>Readme.md</Typography>
              <Divider className={classes.divider} />
              <ReactMarkdown className={classes.markdown}>
                {data.content || 'Oops! There was a problem retrieving data'}
              </ReactMarkdown>
            </Grid>
          </Grid>
        )
      )}
    </Layout>
  );
};

export default Projects;
