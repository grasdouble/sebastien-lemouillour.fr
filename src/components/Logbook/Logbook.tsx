import React from 'react';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import {
  typoH2Props,
  typoH3Props,
  typoH4Props,
  typoCaptionProps,
  typoTextProps,
} from 'utils/typoProps';

import data2021 from 'datas/logbook/2021.json';
import data2022 from 'datas/logbook/2022.json';

const PREFIX = 'Logbook';

const classes = {
  divider: `${PREFIX}-divider`,
  wrapText: `${PREFIX}-wrapText`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.divider}`]: {
    marginBottom: '20px',
  },

  [`& .${classes.wrapText}`]: {
    overflowWrap: 'break-word',
    hyphens: 'auto',
  },
}));

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

const generateLogbookContent = ({ date, contents }: LogbookDay) => {
  const getContent = (entry: LogbookDayContent, idx: Number) => {
    switch (entry.type) {
      case 'title':
        return (
          <Root>
            <Typography {...typoH3Props} key={`logbook_item_${date}_${idx}`}>
              {entry.value}
            </Typography>
          </Root>
        );
      case 'subtitle':
        return (
          <Root>
            <Typography
              {...typoH4Props}
              className={classes.wrapText}
              key={`logbook_item_${date}_${idx}`}
            >
              {entry.value}
            </Typography>
          </Root>
        );
      case 'caption':
        return (
          <Root>
            <Typography
              {...typoCaptionProps}
              className={classes.wrapText}
              key={`logbook_item_${date}_${idx}`}
            >
              {entry.value}
            </Typography>
          </Root>
        );
      case 'text':
      default:
        return (
          <Root>
            <Typography
              {...typoTextProps}
              className={classes.wrapText}
              key={`logbook_item_${date}_${idx}`}
            >
              {entry.value}
            </Typography>
          </Root>
        );
    }
  };
  return contents.map(getContent);
};

export const Logbook: React.FunctionComponent<LogbookProps> = ({
  onlyLast,
}) => {
  const data = onlyLast ? [data2022[1]] : [...data2022, ...data2021];

  const getLogbook = (logbookItem: LogbookDay) => {
    return (
      logbookItem.date !== '0000-00-00' && (
        <Root key={`logbook_item_fragment_${logbookItem.date}`}>
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
          {generateLogbookContent(logbookItem)}
        </Root>
      )
    );
  };
  return <React.Fragment>{data.map(getLogbook)}</React.Fragment>;
};
