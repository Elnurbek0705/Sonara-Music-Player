import React from "react";
import PlayerContainer from "./components/PlayerContainer";
import usePlayer from "./hooks/usePlayer";
import useTheme from "./hooks/useTheme";

const App = () => {
  const player = usePlayer();
  const theme = useTheme();

  return (
    <div className="app-wrapper h-screen overflow-hidden">
      <PlayerContainer {...player} theme={theme.theme} toggleTheme={theme.toggleTheme} />
    </div>
  );
};

export default App;
