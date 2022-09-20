import React from 'react';

import AboutMe from 'pages/AboutMe';
import Background from 'pages/Background';
import Logbook from 'pages/Logbook';
import Projects from 'pages/Projects/Projects';
import UnderConstruction from 'components/UnderConstruction';

import routesConfig from 'routes.json';

export type ProjectInfo = {
  startDate: string;
  githubUrl: string;
  readmePath: string;
};

export type RouteConfig = {
  key: string;
  text: string;
  path: string;
  hidden?: boolean;
  exact?: boolean;
  nested?: RouteConfig[];
  component: string;
  props?: {
    projectInfo?: ProjectInfo;
  };
};

type RoutePath = {
  path: string;
  component: React.FunctionComponent;
  exact: boolean;
};

// TODO: Find a solution to replace any
const components: any = {
  AboutMe: AboutMe,
  Background: Background,
  Logbook: Logbook,
  Projects: Projects,
  None: UnderConstruction,
};

const getRouteConfig = (result: RoutePath[], route: RouteConfig) => {
  if (route.nested) {
    result.push(...route.nested.reduce(getRouteConfig, []));
  } else {
    const Compo = components[route.component];

    result.push({
      path: route.path,
      component: () => <Compo {...route.props} />,
      exact: route.exact || false,
    });
  }
  return result;
};

export const myRoutes = routesConfig.reduce(getRouteConfig, []);
