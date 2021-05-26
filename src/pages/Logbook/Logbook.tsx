import React from "react";

import Typography from "@material-ui/core/Typography";

import { typoH1Props, typoH3Props } from "utils/typoProps";
import LogbookComponent from "components/Logbook";

import MainTemplate from "layouts/Main";

const Logbook: React.FunctionComponent = () => {
  return (
    <MainTemplate>
      <Typography {...typoH1Props}>Logbook - 2021</Typography>
      <Typography {...typoH3Props}>
        A Logbook to talk about all and nothing in the same place
      </Typography>
      <LogbookComponent />
    </MainTemplate>
  );
};

export default Logbook;
