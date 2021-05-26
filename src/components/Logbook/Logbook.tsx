import React from "react";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import {
  typoH2Props,
  typoH3Props,
  typoH4Props,
  typoCaptionProps,
  typoTextProps,
} from "utils/typoProps";

import data2021 from "datas/logbook/2021.json";
import { ClassNameMap } from "@material-ui/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      marginBottom: "20px",
    },
    wrapText: {
      overflowWrap: "break-word",
      hyphens: "auto",
    },
  })
);

type logbookDayContent = {
  type: string;
  value: string;
}

type logbookDay = {
  date: string;
  contents: logbookDayContent[];
}

type LogbookProps = {
  onlyLast?: boolean,
}

const generateLogbookContent = (
  day: logbookDay,
  classes: ClassNameMap<"wrapText">
) => {
  const result: JSX.Element[] = [];

  day.contents.forEach((entry: logbookDayContent, idx: Number) => {
    switch (entry.type) {
      case "title":
        result.push(
          <Typography
            {...typoH3Props}
            className={classes.wrapText}
            key={`logbook_item_${day.date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
        break;
      case "subtitle":
        result.push(
          <Typography
            {...typoH4Props}
            className={classes.wrapText}
            key={`logbook_item_${day.date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
        break;
      case "caption":
        result.push(
          <Typography
            {...typoCaptionProps}
            className={classes.wrapText}
            key={`logbook_item_${day.date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
        break;
      case "text":
      default:
        result.push(
          <Typography
            {...typoTextProps}
            className={classes.wrapText}
            key={`logbook_item_${day.date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
    }
  });
  return result;
};

export const Logbook: React.FunctionComponent<LogbookProps> = ({onlyLast}) => {
  const classes = useStyles();
  const result: JSX.Element[] = [];

  const data = onlyLast ? [data2021[1]] : data2021;

  data.forEach((day:logbookDay) => {
    if (day.date !== "0000-00-00") {
      result.push(
        <Divider
          className={classes.divider}
          key={`logbook_item_divider_${day.date}`}
        />
      );
      result.push(
        <Typography {...typoH2Props} key={`logbook_item_date_${day.date}`}>
          {day.date}
        </Typography>
      );
      result.push(...generateLogbookContent(day, classes));
    }
  });
  return <React.Fragment>{result}</React.Fragment>;
};
