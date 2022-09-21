import React from 'react';
import Typography from '@mui/material/Typography';

import { typoH1Props, typoTextProps } from 'utils/typoProps';

const Talend: React.FunctionComponent = () => {
  return (
    <div>
      <Typography {...typoH1Props}>Talend: since 2017</Typography>
      <Typography {...typoTextProps}>
        Lastly, i moved to Talend where I entered as Frontend Developer and
        where i progressivly took the position of Senior Frontend Developer and
        after Principal Software Engineer.
        <br />
      </Typography>
      <Typography {...typoTextProps}>
        Talend is a world wide company who provide solution to their customers
        to manage data on the cloud.
        <br />
      </Typography>
      <Typography {...typoTextProps}>
        This is there where i had the opportunity to put in place all what i
        learned in my previous experiences to manage big features, to reduce the
        risk of production issues and improve team work.
      </Typography>
    </div>
  );
};

export default Talend;
