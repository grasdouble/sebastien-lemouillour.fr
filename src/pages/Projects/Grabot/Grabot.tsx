import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import MainTemplate from "layouts/Main";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    markdown: {
      "& img": {
        maxWidth: "80vw",
      },
    },
  })
);

type fetchState = {
  isLoading: boolean;
  content: string | undefined;
};

const Grabot: React.FunctionComponent = () => {
  const classes = useStyles();

  const [data, setData] = useState<fetchState>({
    isLoading: false,
    content: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      setData({ isLoading: true, content: undefined });

      const res = await fetch(
        "https://raw.githubusercontent.com/Sanoofr/Grabot/main/README.md"
      );
      const text = await res.text();

      setData({ isLoading: false, content: text });
    };
    fetchData();
  }, [setData]);

  return (
    <MainTemplate>
      {data.isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ReactMarkdown className={classes.markdown}>
          {data.content || "Oops! There was a problem retrieving data"}
        </ReactMarkdown>
      )}
    </MainTemplate>
  );
};

export default Grabot;
