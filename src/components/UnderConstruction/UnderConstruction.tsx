import React from 'react';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
const PREFIX = 'UnderConstruction';

const classes = {
  bg: `${PREFIX}-bg`,
};

const Root = styled('div')({
  [`&.${classes.bg}`]: {
    backgroundImage: 'url("/img/site_under_contruction_by_gudkiller01.jpg")',
    height: '100vh',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
});

const UnderConstruction: React.FunctionComponent = () => {
  return <Root className={clsx(classes.bg)} />;
};

export default UnderConstruction;
