import clsx from "clsx";
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles,
} from "@material-ui/core/styles";
import StepConnector from "@material-ui/core/StepConnector";
import { StepIconProps } from "@material-ui/core/StepIcon";

import LooksOne from "@material-ui/icons/LooksOne";
import LooksTwo from "@material-ui/icons/LooksTwo";
import Looks3 from "@material-ui/icons/Looks3";
import Looks4 from "@material-ui/icons/Looks4";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  })
);

export const StyleConnector = withStyles({
  alternativeLabel: {
    top: 22,
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
  },
})(StepConnector);

const useStyleColorStepIcon = makeStyles({
  root: {
    backgroundColor: "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  },
});

export const StyleStepIcon = (props: StepIconProps) => {
  const classes = useStyleColorStepIcon();
  const { active } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <LooksOne />,
    2: <LooksTwo />,
    3: <Looks3 />,
    4: <Looks4 />,
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
};
