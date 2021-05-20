import React from "react";

import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepButton from "@material-ui/core/StepButton";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { StyleConnector, StyleStepIcon, useStyles } from "./BackgroundStyles";
import ImInfo from "./ImInfo";
import Steria from "./Steria";
import Infotel from "./Infotel";
import Talend from "./Talend";

import MainTemplate from "../../Templates/Main";

const getSteps = () => {
  return ["IM'Info", "Sopra/Steria", "Infotel", "Talend"];
};

const getStepContent = (step: number) => {
  switch (step) {
    case 0:
      return <ImInfo />;
    case 1:
      return <Steria />;
    case 2:
      return <Infotel />;
    case 3:
      return <Talend />;
    default:
      return "Unknown step";
  }
};

const Background: React.FunctionComponent = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  return (
    <MainTemplate>
      <div className={classes.root}>
        <Stepper
          alternativeLabel
          nonLinear
          activeStep={activeStep}
          connector={<StyleConnector />}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton onClick={handleStep(index)}>
                <StepLabel StepIconComponent={StyleStepIcon}>{label}</StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <div>
          <div>
            <Typography className={classes.instructions}>
              {getStepContent(activeStep)}
            </Typography>
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.button}
              >
                Back
              </Button>
              <Button
                disabled={activeStep === steps.length - 1}
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainTemplate>
  );
};

export default Background;
