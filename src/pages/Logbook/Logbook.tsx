import React from 'react';

import Typography from '@mui/material/Typography';

import { typoH1Props, typoH6Props } from 'utils/typoProps';
import LogbookComponent from 'components/Logbook';

import Layout from 'layouts';

const Logbook: React.FunctionComponent = () => {
  return (
    <Layout>
      <Typography {...typoH1Props}>Logbook: 2021-2022</Typography>
      <Typography {...typoH6Props}>
        A Logbook to talk about all and nothing in the same place
      </Typography>
      <LogbookComponent />
    </Layout>
  );
};

export default Logbook;
