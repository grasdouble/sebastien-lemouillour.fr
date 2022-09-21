import React from 'react';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import MenuIcon from '@mui/icons-material/Menu';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
    appBar: {
      [theme.breakpoints.up('sm')]: {
        zIndex: theme.zIndex.drawer + 1,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
  }),
);

interface MyProps {
  children?: React.ReactNode;
  sidepanelFct: Function;
}

const HeaderBar: React.FunctionComponent<MyProps> = ({ sidepanelFct }) => {
  const classes = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => sidepanelFct(true)}
          edge="start"
          className={classes.menuButton}
          size="large"
        >
          <MenuIcon />
        </IconButton>
        <Typography noWrap>Sebastien Le Mouillour</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderBar;
