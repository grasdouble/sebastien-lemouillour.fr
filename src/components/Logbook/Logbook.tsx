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

type LogbookDayContent = {
  type: string;
  value: string;
};

type LogbookDay = {
  date: string;
  contents: LogbookDayContent[];
};

type LogbookProps = {
  onlyLast?: boolean;
};

const generateLogbookContent = (
  { date, contents }: LogbookDay,
  classes: ClassNameMap<"wrapText">
) => {
  const getContent = (
    result: JSX.Element[],
    entry: LogbookDayContent,
    idx: Number
  ) => {
    switch (entry.type) {
      case "title":
        result.push(
          <Typography
            {...typoH3Props}
            className={classes.wrapText}
            key={`logbook_item_${date}_${idx}`}
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
            key={`logbook_item_${date}_${idx}`}
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
            key={`logbook_item_${date}_${idx}`}
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
            key={`logbook_item_${date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
    }
    return result;
  };
  return contents.reduce(getContent, []);
};

export const Logbook: React.FunctionComponent<LogbookProps> = ({
  onlyLast,
}) => {
  const classes = useStyles();
  const data = onlyLast ? [data2021[1]] : data2021;

  const getLogbook = (result: JSX.Element[], logbookItem: LogbookDay) => {
    if (logbookItem.date !== "0000-00-00") {
      result.push(
        <Divider
          className={classes.divider}
          key={`logbook_item_divider_${logbookItem.date}`}
        />
      );
      result.push(
        <Typography
          {...typoH2Props}
          key={`logbook_item_date_${logbookItem.date}`}
        >
          {logbookItem.date}
        </Typography>
      );
      result.push(...generateLogbookContent(logbookItem, classes));
    }
    return result;
  };
  return <React.Fragment>{data.reduce(getLogbook, [])}</React.Fragment>;
};
