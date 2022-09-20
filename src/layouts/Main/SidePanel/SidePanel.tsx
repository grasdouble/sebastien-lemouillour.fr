import React from "react";

import { Link as LinkRouter, LinkProps, useLocation } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Hidden from "@material-ui/core/Hidden";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";

import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import BookmarksIcon from "@material-ui/icons/Bookmarks";
import InsertChartIcon from "@material-ui/icons/InsertChart";
import DraftsIcon from "@material-ui/icons/Drafts";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";

import { drawerWidth } from "layouts/Main/constants";
import config from "routes.json";
import { RouteConfig } from "routes";

const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  icon: {
    minWidth: "40px",
  },
}));

const mapIcons = new Map([
  ["aboutme", <AccountCircleIcon />],
  ["background", <BookmarksIcon />],
  ["skills", <InsertChartIcon />],
  ["contactme", <DraftsIcon />],
  ["logbook", <MenuBookIcon />],
  ["projects", <AccountTreeOutlinedIcon />],
  ["projects-archived", <PowerSettingsNewIcon />],
]);

type SidePanelProps = {
  sidepanelState: boolean;
  sidepanelFct: Function;
  collapsedMenuState: Map<string, boolean>;
  collapsedMenuFct: Function;
};

const CustomLink = (
  path: string,
  props: JSX.IntrinsicAttributes &
    LinkProps &
    React.RefAttributes<HTMLAnchorElement>
) => {
  return <LinkRouter {...props} to={path} />;
};

const toggleDrawer =
  (open: boolean, sidepanelFct: Function) =>
  (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    sidepanelFct(open);
  };

const SidePanel: React.FunctionComponent<SidePanelProps> = ({
  sidepanelState,
  sidepanelFct,
  collapsedMenuState,
  collapsedMenuFct,
}) => {
  const classes = useStyles();
  const location = useLocation();
  const [refreshMe, refreshSidepanel] = React.useState(false);

  const getSidePanelContent = (route: RouteConfig) => {
    if (route.path !== "#") {
      return (
        <ListItem
          button
          key={route.key}
          selected={route.path === location.pathname}
          component={(props) => CustomLink(route.path, props)}
        >
          <ListItemIcon className={classes.icon}>
            {mapIcons.get(route.key)}
          </ListItemIcon>
          <ListItemText primary={route.text} />
        </ListItem>
      );
    } else {
      const isOpen = collapsedMenuState.get(route.key);
      return (
        <React.Fragment key={`${route.key}_fragment`}>
          <ListItem
            button
            onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
              handleClick(route.key, e)
            }
            key={route.key}
          >
            <ListItemIcon className={classes.icon}>
              {mapIcons.get(route.key)}
            </ListItemIcon>
            <ListItemText primary={route.text} />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse
            in={isOpen}
            timeout="auto"
            unmountOnExit
            key={`${route.key}_collaple`}
          >
            <List component="div" disablePadding>
              {(route.nested || []).map(getSidePanelContent)}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
  };

  const handleClick = (item: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    collapsedMenuState.set(item, true);
    collapsedMenuFct(collapsedMenuState);
    refreshSidepanel(!refreshMe);
  };

  return (
    <nav className={classes.drawer}>
      <Hidden smUp implementation="css">
        <Drawer
          anchor="left"
          open={sidepanelState}
          onClose={toggleDrawer(false, sidepanelFct)}
        >
          <div
            role="presentation"
            onClick={toggleDrawer(false, sidepanelFct)}
            onKeyDown={toggleDrawer(false, sidepanelFct)}
          >
            <List>{config.map(getSidePanelContent)}</List>
            <Divider />
          </div>
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
        >
          <div className={classes.toolbar} />
          <List>{config.map(getSidePanelContent)}</List>
          <Divider />
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default SidePanel;
