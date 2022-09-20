import React from 'react';

import '@fontsource/roboto';

import { Routes, Route } from 'react-router-dom';
import { myRoutes } from 'routes';

import UnderConstruction from 'components/UnderConstruction';

function App() {
  const GetContent = (props: any) => {
    if (true) {
      return (
        <Routes>
          {myRoutes.map(({ path, component }, i) => (
            <Route
              key={i}
              path={path}
              element={
                <React.Fragment>{component({ ...props })}</React.Fragment>
              }
            />
          ))}
        </Routes>
      );
    } else {
      return <UnderConstruction />;
    }
  };

  return (
    <div className="App">
      <GetContent />
    </div>
  );
}

export default App;
