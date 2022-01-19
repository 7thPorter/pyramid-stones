import { useState, useRef, useEffect } from "react";

import logo from "./logo.svg";
import "./App.css";

function App() {
  //--------------------
  //----------------------------------------
  //This block handles the overall simulation timer. The timer counts down as soon as the 'Start Simulation' button is pressed, and the buttom becomes unpressable for the duration.
  //Additionally, the 'Pause Simulation' button is disabled until the simulation starts, then after starting, it allows the simulation to be paused or resumed at any point.
  //Finally, the 'Restart Simulation' button sets all related states and variables to their starting values.
  const [totalSimulationTime, setTotalSimulationTime] = useState(120);
  const [timeRemaining, setTimeRemaining] = useState(totalSimulationTime);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulationPaused, setSimulationPaused] = useState(false);

  //I chose to use 'useRef' here rather than useState, becasue
  const intervalRef = useRef();

  const startSimulation = (time) => {
    setTimeRemaining(time);
    setSimulationStarted(true);
    setSimulationPaused(false);

    intervalRef.current = setInterval((timeRemaining) => {
      setTimeRemaining((timeRemaining) => {
        const currentTimeRemaining = timeRemaining - 1;

        if (currentTimeRemaining <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
          setSimulationPaused(false);
          return currentTimeRemaining;
        } else return currentTimeRemaining;
      });
    }, 1000);
  };

  const pauseOrResumeSimulation = () => {
    if (!simulationPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
      setSimulationPaused(true);
    } else {
      startSimulation(timeRemaining);
    }
  };

  const restartSimulation = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
    setTimeRemaining(totalSimulationTime);
    setSimulationStarted(false);
    setSimulationPaused(false);
  };
  //----------------------------------------
  //--------------------
  //----------------------------------------

  const [numberOfBoats, setNumberOfBoats] = useState(20);
  const [boatsAtCapitol, setBoatsAtCapitol] = useState(
    Array.from(Array(numberOfBoats).keys())
  );
  const [boatsOnRiver, setBoatsOnRiver] = useState([]);

  console.log(boatsAtCapitol);

  //----------------------------------------
  //--------------------
  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className={
            simulationStarted && !simulationPaused && timeRemaining > 0
              ? "App-logo-animation"
              : "App-logo"
          }
          alt="logo"
        />
        <p>
          <button
            onClick={() => startSimulation(totalSimulationTime)}
            disabled={simulationStarted}
          >
            Start Simulation
          </button>
          <button
            onClick={pauseOrResumeSimulation}
            disabled={!simulationStarted}
          >
            {simulationPaused ? "Resume Simulation" : "Pause Simulation"}
          </button>
          <button onClick={restartSimulation} disabled={!simulationStarted}>
            Restart Simulation
          </button>
          <br></br>
          Time Remaining: {timeRemaining}
        </p>
      </header>
    </div>
  );
}

export default App;

// simulationPaused ? resumeSimulation :
