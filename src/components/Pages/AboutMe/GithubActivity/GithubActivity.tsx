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

import { typoH1Props } from "../../../../utils/typoProps";

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

const formatActivityItem = (
  activity: {
    actor: { display_login: any; avatar_url: any };
    repo: { name: any };
    created_at: any;
    payload: { commits: never[] };
  },
  classes: { inline: string; divider: string }
) => {
  const login = activity.actor.display_login;
  const avatarUrl = activity.actor.avatar_url;
  const repoName = activity.repo.name;
  const activityPush = activity.created_at;
  const commits = activity.payload.commits || [];

  const result: JSX.Element[] = [];

  commits.forEach((commit: { sha: string; message: string }, idx) => {
    result.push(
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
                Date:{" "}
              </Typography>
              {activityPush}
            </React.Fragment>
          }
        />
      </ListItem>
    );
    result.push(
      <Divider className={classes.divider} key={`divider_${commit.sha}`} />
    );
  });

  return result;
};

const formatActivities = (activities: any[], classes: any) => {
  const result: JSX.Element[] = [];
  activities.forEach((activity) => {
    result.push(...formatActivityItem(activity, classes));
  });
  return result;
};

const GithubActivity: React.FunctionComponent = () => {
  const classes = useStyles();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const res = await fetch("https://api.github.com/users/Noofreuuuh/events");
      const json = await res.json();

      setData(json);
      setIsLoading(false);
    };
    fetchData();
  }, [setData]);

  return (
    <Container maxWidth="lg">
      <Typography {...typoH1Props}>Github Activity</Typography>
      <Divider className={classes.divider} />
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <List className={classes.root}>{formatActivities(data, classes)}</List>
      )}
    </Container>
  );
};

export default GithubActivity;
