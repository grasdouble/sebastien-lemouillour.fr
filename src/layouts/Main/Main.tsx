import React from 'react';
import { styled } from '@mui/material/styles';
// import { Theme } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
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
};

const StyledStyledEngineProvider = styled(StyledEngineProvider)(
  ({ theme: Theme }) => ({
    [`& .${classes.root}`]: {
      display: 'flex',
    },

    [`& .${classes.toolbar}`]: Theme.mixins.toolbar,

    [`& .${classes.content}`]: {
      flexGrow: 1,
      width: '100vw',
      padding: Theme.spacing(3),
      marginLeft: Theme.spacing(0),
      marginRight: Theme.spacing(0),
      [Theme.breakpoints.up('md')]: {
        marginLeft: Theme.spacing(9),
        marginRight: Theme.spacing(9),
      },
    },

    [`& .${classes.gridMain}`]: {
      flexGrow: 1,
    },

    [`& .${classes.links}`]: {
      [Theme.breakpoints.down('lg')]: {
        paddingLeft: Theme.spacing(2),
        marginTop: 'auto',
        marginBottom: 'auto',
      },
      [Theme.breakpoints.up('md')]: {
        marginTop: Theme.spacing(2),
      },
    },

    [`& .${classes.avatar}`]: {
      border: '5px solid',
      [Theme.breakpoints.down('lg')]: {
        margin: Theme.spacing(1),
        width: Theme.spacing(15),
        height: Theme.spacing(15),
      },
      [Theme.breakpoints.up('md')]: {
        width: Theme.spacing(20),
        height: Theme.spacing(20),
      },
    },

    [`& .${classes.divider}`]: {
      marginBottom: '20px',
    },
  }),
);

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
    <StyledStyledEngineProvider injectFirst>
      <ThemeProvider theme={isLight ? themeLight : themeDark}>
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
                  <Grid container justifyContent="center">
                    <Grid key="avatar" item>
                      <Avatar
                        alt="Sebastien Le Mouillour"
                        className={classes.avatar}
                        src="/img/avatar.jfif"
                      >
                        Sébastien
                        <br />
                        LE MOUILLOUR
                      </Avatar>
                    </Grid>
                    <Grid key="links" className={classes.links} item>
                      <Box textAlign="center">
                        <Box textAlign="left">
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
                        <Box textAlign="left" mt={1}>
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
                        <Box textAlign="left" mt={1}>
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
      </ThemeProvider>
    </StyledStyledEngineProvider>
  );
};

export default Main;
