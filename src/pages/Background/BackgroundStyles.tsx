import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import StepConnector from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';

import LooksOne from '@mui/icons-material/LooksOne';
import LooksTwo from '@mui/icons-material/LooksTwo';
import Looks3 from '@mui/icons-material/Looks3';
import Looks4 from '@mui/icons-material/Looks4';

const PREFIX = 'StyleConnector';

const classes = {
  alternativeLabel: `${PREFIX}-alternativeLabel`,
  line: `${PREFIX}-line`,
  root: `${PREFIX}-root`,
  active: `${PREFIX}-active`,
};

const Root = styled('div')({
  [`&.${classes.root}`]: {
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  [`&.${classes.active}`]: {
    backgroundImage:
      'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  },
});

export const StyleConnector = StepConnector;

export const StyleStepIcon = (props: StepIconProps) => {
  const { active } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <LooksOne />,
    2: <LooksTwo />,
    3: <Looks3 />,
    4: <Looks4 />,
  };

  return (
    <Root
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {icons[String(props.icon)]}
    </Root>
  );
};
