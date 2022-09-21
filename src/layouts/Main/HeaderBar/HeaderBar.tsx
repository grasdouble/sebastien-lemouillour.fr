import React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import MenuIcon from '@mui/icons-material/Menu';

const PREFIX = 'HeaderBar';

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  appBar: `${PREFIX}-appBar`,
  menuButton: `${PREFIX}-menuButton`,
};

const StyledAppBar = styled(AppBar)(({ theme: Theme }) => ({
  [`& .${classes.toolbar}`]: Theme.mixins.toolbar,

  [`&.${classes.appBar}`]: {
    [Theme.breakpoints.up('sm')]: {
      zIndex: Theme.zIndex.drawer + 1,
    },
  },

  [`& .${classes.menuButton}`]: {
    marginRight: Theme.spacing(2),
    [Theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
}));

interface MyProps {
  children?: React.ReactNode;
  sidepanelFct: Function;
}

const HeaderBar: React.FunctionComponent<MyProps> = ({ sidepanelFct }) => {
  return (
    <StyledAppBar position="fixed" className={classes.appBar}>
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
    </StyledAppBar>
  );
};

export default HeaderBar;
