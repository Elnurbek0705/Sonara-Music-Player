import React from "react";
import PlayerContainer from "./components/PlayerContainer";
import usePlayer from "./hooks/usePlayer";

const App = () => {
  const player = usePlayer();

  return (
    <div className="app-wrapper h-screen bg-transparent overflow-hidden">
      <PlayerContainer {...player} />
    </div>
  );
};

export default App;
