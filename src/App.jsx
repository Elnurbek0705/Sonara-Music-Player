import React from "react";
import PlayerContainer from "./components/PlayerContainer";
import UpdateNotification from "./components/UpdateNotification";
import usePlayer from "./hooks/usePlayer";
import useTheme from "./hooks/useTheme";
import { applyTheme, getSavedTheme  } from "./themes/themes";

const App = () => {
   applyTheme(getSavedTheme());
  const player = usePlayer();
  const theme = useTheme();

  return (
    <div className="app-wrapper h-screen overflow-hidden">
      <PlayerContainer {...player} theme={theme.theme} toggleTheme={theme.toggleTheme} />
      <UpdateNotification />
    </div>
  );
};

export default App;
