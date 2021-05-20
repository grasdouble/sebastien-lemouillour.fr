import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider } from "@material-ui/core/styles";
import "@fontsource/roboto";

import { Switch } from "react-router-dom";
import { routes, RouteWithSubRoutes } from "./routes";

import { themeLight } from "./utils/theme/themeLight";
import { themeDark } from "./utils/theme/themeDark";
import HeaderBar from "./components/HeaderBar";
import SidePanel from "./components/SidePanel";
import UnderConstruction from "./components/UnderConstruction";

function App() {
  const isLight = true;
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState("aboutme");

  const GetContent = () => {
    if (localStorage.getItem("dev")) {
      return (
        <MuiThemeProvider theme={isLight ? themeLight : themeDark}>
          <CssBaseline />
          <HeaderBar sidepanelFct={setOpen} />
          <SidePanel
            sidepanelState={open}
            sidepanelFct={setOpen}
            pageState={page}
            pageFct={setPage}
          />
          <Switch>
            {routes.map((route, i) => (
              <RouteWithSubRoutes key={i} {...route} />
            ))}
          </Switch>
        </MuiThemeProvider>
      );
    } else {
      return <UnderConstruction />;
    }
  };

  return (
    <div className="App">
      <header className="App-header"></header>
      <main>
        <GetContent />
      </main>
    </div>
  );
}

export default App;
