import React from "react";
import Typography from "@material-ui/core/Typography";

import {
  typoH1Props,
  typoH2Props,
  typoTextProps,
} from "../../../../utils/typoProps";

const ImInfo: React.FunctionComponent = () => {
  return (
    <div>
      <Typography {...typoH1Props}>Im'Info: 2007 - 2009</Typography>
      <Typography {...typoTextProps}>
        My career begins in 2007 with ImInfo where I did my end-of-studies
        internship and I had the opportunity to start my real working experience
        as software developer.
        <br />
      </Typography>
      <Typography {...typoTextProps}>
        ImInfo was a company that works specifically on projects in Java and
        offered several training courses around this language.
        <br />
      </Typography>
      <Typography {...typoTextProps}>
        In this company I applied what I learned during my studies while working
        on different projects in Java and I contributed to the creation of
        multiple training support until 2009.
      </Typography>
      <Typography {...typoH2Props}>
        Most Important Project / Customer
      </Typography>
    </div>
  );
};

export default ImInfo;
