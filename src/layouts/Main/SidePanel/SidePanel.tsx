import React from "react";
import clsx from "clsx";

import { Link as LinkRouter, LinkProps, useLocation } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";

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

import config from "routes.json";
import { RouteConfig } from "routes";

const useStyles = makeStyles({
  list: {
    width: 250,
  },
});

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
}) => {
  const classes = useStyles();
  const location = useLocation();

  const getSidePanelContent = (route: RouteConfig) => {
    if (route.path !== "#") {
      return (
        <ListItem
          button
          key={route.key}
          selected={route.path === location.pathname}
          component={(props) => CustomLink(route.path, props)}
        >
          <ListItemIcon>{mapIcons.get(route.key)}</ListItemIcon>
          <ListItemText primary={route.text} />
        </ListItem>
      );
    } else {
      const isOpen = open.get(route.key);
      return (
        <React.Fragment key={`${route.key}_fragment`}>
          <ListItem
            button
            onClick={(e) => handleClick(route.key, e)}
            key={route.key}
          >
            <ListItemIcon>{mapIcons.get(route.key)}</ListItemIcon>
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

  const [open, setOpen] = React.useState(new Map<string, boolean>());
  const [refreshMe, refreshSidepanel] = React.useState(false);

  const handleClick = (item: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open.set(item, !open.get(item));
    setOpen(open);
    refreshSidepanel(!refreshMe);
  };

  return (
    <div>
      <Drawer
        anchor="left"
        open={sidepanelState}
        onClose={toggleDrawer(false, sidepanelFct)}
      >
        <div
          className={clsx(classes.list)}
          role="presentation"
          onClick={toggleDrawer(false, sidepanelFct)}
          onKeyDown={toggleDrawer(false, sidepanelFct)}
        >
          <List>{config.map(getSidePanelContent)}</List>
          <Divider />
        </div>
      </Drawer>
    </div>
  );
};

export default SidePanel;
