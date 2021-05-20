import React from "react";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";

import { typoH1Props } from "../../../../utils/typoProps";
import { LogbookLastEntry } from "../../../../utils/logbookUtils";

const LogbookEntry: React.FunctionComponent = () => {
  return (
    <Container maxWidth="lg">
      <Typography {...typoH1Props}>Last logbook entry</Typography>
      <LogbookLastEntry />
      <Typography align="right">
        <Link to="/logbook">See more -&gt;</Link>
      </Typography>
    </Container>
  );
};

export default LogbookEntry;
