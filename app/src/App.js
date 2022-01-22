import { useState, useRef, useEffect, useMemo } from "react";

import logo from "./logo.svg";
import "./App.css";

function App() {
  const [totalSimulationTime, setTotalSimulationTime] = useState(120);
  const [timeRemaining, setTimeRemaining] = useState(totalSimulationTime);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [timeToLoad, setTimeToLoad] = useState(6);
  const [timeToUnload, setTimeToUnload] = useState(12);
  const [timeOnWater, setTimeOnWater] = useState(10);
  const [blocksUnloaded, setBlocksUnloaded] = useState(0);
  const [numberOfBoats, setNumberOfBoats] = useState(1);
  const [boats, setBoats] = useState([]);

  useEffect(() => {
    if (boats.length === numberOfBoats) {
      return;
    }
    let newBoats = boats.slice();
    while (newBoats.length < numberOfBoats) {
      newBoats.push({ location: "capitol", timer: 0, loaded: false });
    }
    while (newBoats.length > numberOfBoats) {
      newBoats.pop();
    }
    setBoats(newBoats);
  }, [numberOfBoats, boats, setBoats]);

  const lastTimeRemaining = useRef(totalSimulationTime);

  useEffect(() => {
    if (lastTimeRemaining.current === timeRemaining) {
      return;
    }

    lastTimeRemaining.current = timeRemaining;

    setBoats((currentBoats) => {
      let boats = currentBoats.slice();

      boats.forEach((boat) => {
        if (boat.location === "river") {
          boat.timer = boat.timer - 1;
          if (boat.timer <= 0) {
            if (boat.loaded) {
              boat.location = "capitol";
              boat.timer = timeToUnload;
            } else {
              boat.location = "quarry";
              boat.timer = timeToLoad;
            }
          }
        } else if (boat.location === "quarry" && boat.loaded === false) {
          boat.timer = boat.timer - 1;
          if (boat.timer <= 0) {
            boat.loaded = true;
          }
        } else if (boat.location === "capitol" && boat.loaded) {
          boat.timer = boat.timer - 1;
          setBlocksUnloaded((blocks) => {
            return blocks + 1;
          });
          if (boat.timer <= 0) {
            boat.loaded = false;
          }
        } else {
          boat.timer = boat.timer - 1;
        }
      });

      let onWater = boats.filter((boat) => {
        return ["river"].includes(boat.location);
      }).length;

      let finishedAtQuarry = boats.filter(
        (boat) => boat.location === "quarry" && boat.loaded === true
      );

      while (onWater < 2) {
        if (finishedAtQuarry.length) {
          const boat = finishedAtQuarry.shift();
          boat.location = "river";
          boat.timer = timeOnWater;
          onWater = onWater + 1;
        } else {
          const boat = boats.find(
            (boat) => boat.location === "capitol" && boat.loaded === false
          );
          if (boat) {
            boat.location = "river";
            boat.timer = timeOnWater;
            onWater = onWater + 1;
          } else {
            // console.error(boats);
            break;
          }
        }
      }
      return boats;
    });
  }, [timeRemaining, timeToUnload, timeToLoad, timeOnWater, setBoats]);

  //--------------------
  //----------------------------------------
  //This block handles the overall simulation timer. The timer counts down as soon as the 'Start Simulation' button is pressed, and the buttom becomes unpressable for the duration.
  //Additionally, the 'Pause Simulation' button is disabled until the simulation starts, then after starting, it allows the simulation to be paused or resumed at any point.
  //Finally, the 'Restart Simulation' button sets all related states and variables to their starting values.
  //I chose to use 'useRef' here rather than useState, because it is accessible globally and doesn't refresh on page re-render, meaning that it persists until the interval is done.
  const simulationIntervalRef = useRef();

  const startSimulation = (time) => {
    setTimeRemaining(time);
    setSimulationStarted(true);
    setSimulationPaused(false);

    simulationIntervalRef.current = setInterval(() => {
      setTimeRemaining((_timeRemaining) => {
        const currentTimeRemaining = _timeRemaining - 1;

        if (currentTimeRemaining <= 0) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = undefined;
          setSimulationPaused(false);
          return currentTimeRemaining;
        } else return currentTimeRemaining;
      });
    }, 1000);
  };

  const pauseOrResumeSimulation = () => {
    if (!simulationPaused) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = undefined;
      setSimulationPaused(true);
    } else {
      startSimulation(timeRemaining);
    }
  };

  const restartSimulation = () => {
    clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = undefined;
    setTimeRemaining(totalSimulationTime);
    setSimulationStarted(false);
    setSimulationPaused(false);
    setBoats([]);
    setBlocksUnloaded(0);
  };
  //----------------------------------------
  //--------------------
  //----------------------------------------
  const boatsWaitingAtCapitol = useMemo(() => {
    return boats.filter((boat) => {
      return boat.location === "capitol" && boat.loaded === false;
    });
  }, [boats]);

  const boatsUnloadingAtCapitol = useMemo(() => {
    return boats.filter((boat) => {
      return boat.location === "capitol" && boat.loaded === true;
    });
  }, [boats]);

  const numberOfBoatsOnRiver = useMemo(() => {
    return boats.filter((boat) => {
      return ["river"].includes(boat.location);
    });
  }, [boats]);

  const boatsWaitingAtQuarry = useMemo(() => {
    return boats.filter((boat) => {
      return boat.location === "quarry" && boat.loaded === true;
    });
  }, [boats]);

  const boatsLoadingAtQuarry = useMemo(() => {
    return boats.filter((boat) => {
      return boat.location === "quarry" && boat.loaded === false;
    });
  }, [boats]);

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
          <br />
          Time Remaining: {timeRemaining}
          <br />
          Blocks Unloaded: {blocksUnloaded}
        </p>
        <hr />
        Boats unloading at the Capitol: {boatsUnloadingAtCapitol.length}
        <br />
        Boats waiting at the Capitol: {boatsWaitingAtCapitol.length}
        <br />
        Boats on the Nile: {numberOfBoatsOnRiver.length}
        <br />
        Boats loading at the Quarry: {boatsLoadingAtQuarry.length}
        <br />
        Boats waiting at the Quarry: {boatsWaitingAtQuarry.length}
      </header>
    </div>
  );
}

export default App;
