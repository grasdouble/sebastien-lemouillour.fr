import React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import {
  typoH2Props,
  typoH3Props,
  typoH4Props,
  typoCaptionProps,
  typoTextProps,
} from 'utils/typoProps';

import data2021 from 'datas/logbook/2021.json';
import data2022 from 'datas/logbook/2022.json';
import { ClassNameMap } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      marginBottom: '20px',
    },
    wrapText: {
      overflowWrap: 'break-word',
      hyphens: 'auto',
    },
  }),
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
  classes: ClassNameMap<'wrapText'>,
) => {
  const getContent = (entry: LogbookDayContent, idx: Number) => {
    switch (entry.type) {
      case 'title':
        return (
          <Typography
            {...typoH3Props}
            className={classes.wrapText}
            key={`logbook_item_${date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
      case 'subtitle':
        return (
          <Typography
            {...typoH4Props}
            className={classes.wrapText}
            key={`logbook_item_${date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
      case 'caption':
        return (
          <Typography
            {...typoCaptionProps}
            className={classes.wrapText}
            key={`logbook_item_${date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
      case 'text':
      default:
        return (
          <Typography
            {...typoTextProps}
            className={classes.wrapText}
            key={`logbook_item_${date}_${idx}`}
          >
            {entry.value}
          </Typography>
        );
    }
  };
  return contents.map(getContent);
};

export const Logbook: React.FunctionComponent<LogbookProps> = ({
  onlyLast,
}) => {
  const classes = useStyles();
  const data = onlyLast ? [data2022[1]] : [...data2022, ...data2021];

  const getLogbook = (logbookItem: LogbookDay) => {
    return (
      logbookItem.date !== '0000-00-00' && (
        <React.Fragment key={`logbook_item_fragment_${logbookItem.date}`}>
          <Divider
            className={classes.divider}
            key={`logbook_item_divider_${logbookItem.date}`}
          />
          <Typography
            {...typoH2Props}
            key={`logbook_item_date_${logbookItem.date}`}
          >
            {logbookItem.date}
          </Typography>
          {generateLogbookContent(logbookItem, classes)}
        </React.Fragment>
      )
    );
  };
  return <React.Fragment>{data.map(getLogbook)}</React.Fragment>;
};
