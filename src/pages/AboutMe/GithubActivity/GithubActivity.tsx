import React, { useState, useEffect } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

import { typoH1Props } from "utils/typoProps";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      marginBottom: "20px",
    },
    root: {
      width: "100%",
      overflow: "auto",
      maxHeight: 300,
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: "inline",
    },
  })
);

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
  classes: { inline: string; divider: string }
) => {
  const login = activity.actor.display_login;
  const avatarUrl = activity.actor.avatar_url;
  const repoName = activity.repo.name;
  const branchName = activity.payload.ref;
  const activityPush = activity.created_at;
  const commits = activity.payload.commits || [];

  const getGithubContent = (commit: GithubCommitInfo) => {
    return (
      <React.Fragment>
        <ListItem alignItems="flex-start" key={commit.sha}>
          <ListItemAvatar key={`avatar_${commit.sha}`}>
            <Avatar alt={login} src={avatarUrl} />
          </ListItemAvatar>
          <ListItemText
            key={`info_${commit.sha}`}
            primary={commit.message}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  On:{" "}
                </Typography>
                {repoName}
                <br />
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  branch:{" "}
                </Typography>
                {branchName.replace("refs/heads/", "")}
                <br />
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  Date:{" "}
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

const formatActivities = (activities: any[], classes: any) => {
  return activities.map((activity) => {
    return formatActivityItem(activity, classes);
  });
};

const GithubActivity: React.FunctionComponent = () => {
  const classes = useStyles();

  const [data, setData] = useState<fetchState>({
    isLoading: false,
    content: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setData({ isLoading: true, content: [] });
      const res = await fetch("https://api.github.com/users/Noofreuuuh/events");
      const json = await res.json();
      setData({ isLoading: false, content: json });
    };
    fetchData();
  }, [setData]);

  return (
    <Container maxWidth="lg">
      <Typography {...typoH1Props}>Github Activity</Typography>
      <Divider className={classes.divider} />
      {data.isLoading ? (
        <div>Loading ...</div>
      ) : (
        <List className={classes.root}>
          {formatActivities(data.content, classes)}
        </List>
      )}
    </Container>
  );
};

export default GithubActivity;
