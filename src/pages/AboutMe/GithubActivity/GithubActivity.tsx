import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import { typoH1Props } from 'utils/typoProps';

const PREFIX = 'GithubActivity';

const classes = {
  divider: `${PREFIX}-divider`,
  root: `${PREFIX}-root`,
  inline: `${PREFIX}-inline`,
};

const StyledBox = styled(Box)(({ theme: Theme }) => ({
  [`& .${classes.divider}`]: {
    marginBottom: '20px',
  },

  [`& .${classes.root}`]: {
    width: '100%',
    overflow: 'auto',
    maxHeight: 300,
    backgroundColor: Theme.palette.background.paper,
  },

  [`& .${classes.inline}`]: {
    display: 'inline',
  },
}));

type GithubActivityItem = {
  actor: { display_login: string; avatar_url: string };
  repo: { name: string };
  created_at: string;
  payload: { commits: GithubCommitInfo[]; ref: string };
};

type GithubCommitInfo = { sha: string; message: string };

type fetchState = {
  isLoading: boolean;
  content: GithubActivityItem[];
};

const formatActivityItem = (
  activity: GithubActivityItem,
  classes: { inline: string; divider: string },
) => {
  const login = activity.actor.display_login;
  const avatarUrl = activity.actor.avatar_url;
  const repoName = activity.repo.name;
  const branchName = activity.payload.ref;
  const activityPush = activity.created_at;
  const commits = activity.payload.commits || [];

  const getGithubContent = (commit: GithubCommitInfo) => {
    return (
      <React.Fragment key={`${commit.sha}_fragment`}>
        <ListItem alignItems="flex-start" key={commit.sha}>
          <ListItemAvatar key={`${commit.sha}_avatar`}>
            <Avatar alt={login} src={avatarUrl} />
          </ListItemAvatar>
          <ListItemText
            key={`${commit.sha}_info`}
            primary={commit.message}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  On:{' '}
                </Typography>
                {repoName}
                <br />
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  branch:{' '}
                </Typography>
                {branchName.replace('refs/heads/', '')}
                <br />
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  Date:{' '}
                </Typography>
                {activityPush}
              </React.Fragment>
            }
          />
        </ListItem>
        <Divider className={classes.divider} key={`divider_${commit.sha}`} />
      </React.Fragment>
    );
  };

  return commits.map(getGithubContent);
};

const formatActivities = (activities: any[]) => {
  return activities.map(activity => {
    return formatActivityItem(activity, classes);
  });
};

const GithubActivity: React.FunctionComponent = () => {
  const [data, setData] = useState<fetchState>({
    isLoading: false,
    content: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setData({ isLoading: true, content: [] });
      const res = await fetch('https://api.github.com/users/Noofreuuuh/events');
      const json = await res.json();
      setData({ isLoading: false, content: json });
    };
    fetchData();
  }, [setData]);

  return (
    <StyledBox>
      <Typography {...typoH1Props}>Github Activity</Typography>
      <Divider className={classes.divider} />
      {data.isLoading ? (
        <div>Loading ...</div>
      ) : (
        <List className={classes.root}>{formatActivities(data.content)}</List>
      )}
    </StyledBox>
  );
};

export default GithubActivity;
