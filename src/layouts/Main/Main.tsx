import React from 'react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import CodeIcon from '@mui/icons-material/Code';

import { themeLight } from 'utils/theme/themeLight';
import { themeDark } from 'utils/theme/themeDark';
import { typoH4Props } from 'utils/typoProps';

import { useLocation } from 'react-router-dom';

import HeaderBar from './HeaderBar';
import SidePanel from './SidePanel';

const PREFIX = 'Main';

const classes = {
  root: `${PREFIX}-root`,
  toolbar: `${PREFIX}-toolbar`,
  content: `${PREFIX}-content`,
  gridMain: `${PREFIX}-gridMain`,
  links: `${PREFIX}-links`,
  avatar: `${PREFIX}-avatar`,
  divider: `${PREFIX}-divider`,
  leftPanel: `${PREFIX}-leftPanel`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: 'flex',
  },

  [`& .${classes.toolbar}`]: theme.mixins.toolbar,

  [`& .${classes.content}`]: {
    flexGrow: 1,
    width: '100vw',
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
  },

  [`& .${classes.gridMain}`]: {
    flexGrow: 1,
  },

  [`& .${classes.leftPanel}`]: {
    display: 'flex',
    'justify-content': 'center',
  },

  [`& .${classes.links}`]: {
    [theme.breakpoints.down('lg')]: {
      paddingLeft: theme.spacing(2),
      marginTop: 'auto',
      marginBottom: 'auto',
    },
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(2),
    },
  },

  [`& .${classes.avatar}`]: {
    border: '5px solid',
    [theme.breakpoints.down('lg')]: {
      margin: theme.spacing(1),
      width: theme.spacing(15),
      height: theme.spacing(15),
    },
    [theme.breakpoints.up('xs')]: {
      width: theme.spacing(20),
      height: theme.spacing(20),
    },
  },

  [`& .${classes.divider}`]: {
    marginBottom: '20px',
  },
}));

const Main: React.FunctionComponent<{ children: React.ReactNode }> = props => {
  const location = useLocation();

  const pathList = location.pathname.split('/');

  const isLight = false;
  const [open, setOpen] = React.useState(false);
  const [collapsedMenu, setCollapsedMenu] = React.useState(
    new Map<string, boolean>([
      pathList.length > 1 ? [pathList[1], true] : ['', false],
    ]),
  );

  return (
    <ThemeProvider theme={isLight ? themeLight : themeDark}>
      <Root>
        <div className={classes.root}>
          <CssBaseline />
          <HeaderBar sidepanelFct={setOpen} />
          <SidePanel
            sidepanelState={open}
            sidepanelFct={setOpen}
            collapsedMenuState={collapsedMenu}
            collapsedMenuFct={setCollapsedMenu}
          />
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Container maxWidth={false}>
              <Divider className={classes.divider} />
              <Typography {...typoH4Props} color="error" align="center">
                !! The website is still under construction and some pages may
                not work properly or the content may be empty !!
              </Typography>
              <Divider className={classes.divider} />

              <Grid
                container
                className={classes.gridMain}
                justifyContent="flex-start"
                spacing={5}
              >
                <Grid key="leftPane" item xs={12} md={3} lg={2}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid
                      key="avatar"
                      item
                      xs={12}
                      className={classes.leftPanel}
                    >
                      <Avatar
                        alt="Sebastien Le Mouillour"
                        className={classes.avatar}
                        src="/img/avatar.jfif"
                      />
                    </Grid>
                    <Grid key="links" className={classes.links} item xs={12}>
                      <Box textAlign="center">
                        <Box>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<LinkedInIcon fontSize="large" />}
                            target="_blank"
                            href="https://www.linkedin.com/in/sebastienlemouillour/"
                          >
                            LinkedIn
                          </Button>
                        </Box>
                        <Box mt={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CodeIcon fontSize="large" />}
                            target="_blank"
                            href="https://leetcode.com/smouillour/"
                          >
                            LeetCode
                          </Button>
                        </Box>
                        <Box mt={1}>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AlternateEmailIcon fontSize="large" />}
                            target="_blank"
                            href="mailto:sebastien.lemouillour@gmail.com"
                          >
                            Contact Me
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid key="rightPane" item xs={12} md={9} lg={10}>
                  {props.children}
                </Grid>
              </Grid>
            </Container>
          </main>
        </div>
      </Root>
    </ThemeProvider>
  );
};

export default Main;
