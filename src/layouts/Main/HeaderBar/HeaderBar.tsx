import React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import MenuIcon from '@mui/icons-material/Menu';
import { responsiveLimit } from '../constants';

const PREFIX = 'HeaderBar';

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  appBar: `${PREFIX}-appBar`,
  menuButton: `${PREFIX}-menuButton`,
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [`& .${classes.toolbar}`]: theme.mixins.toolbar,

  [`&.${classes.appBar}`]: {
    [theme.breakpoints.up(responsiveLimit)]: {
      zIndex: theme.zIndex.drawer + 1,
    },
  },

  [`& .${classes.menuButton}`]: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(responsiveLimit)]: {
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
    <StyledAppBar position="fixed" className={classes.appBar} enableColorOnDark>
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
