import React from 'react';

import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';

import { typoH1Props } from 'utils/typoProps';
import LogbookComponent from 'components/Logbook';
import { linkStyle } from 'layouts/Main/constants';

const PREFIX = 'LogBookEntry';

const classes = {
  link: `${PREFIX}-link`,
};

const LogBookEntryStyled = styled(Box)(({ theme }) => ({
  [`& .${classes.link}`]: linkStyle,
}));

const LogbookEntry: React.FunctionComponent = () => {
  return (
    <LogBookEntryStyled>
      <Typography {...typoH1Props}>Last logbook entry</Typography>
      <LogbookComponent onlyLast={true} />
      <Typography align="right">
        <Link to="/logbook" className={classes.link}>
          See more -&gt;
        </Link>
      </Typography>
    </LogBookEntryStyled>
  );
};

export default LogbookEntry;
