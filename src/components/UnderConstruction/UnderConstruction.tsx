import React from 'react';
import clsx from 'clsx';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles({
  bg: {
    backgroundImage: 'url("/img/site_under_contruction_by_gudkiller01.jpg")',
    height: '100vh',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
});

const UnderConstruction: React.FunctionComponent = () => {
  const classes = useStyles();
  return <div className={clsx(classes.bg)} />;
};

export default UnderConstruction;
