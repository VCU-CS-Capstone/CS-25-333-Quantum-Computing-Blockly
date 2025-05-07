import './App.css'
import {useState, useEffect} from 'react';
import axios from 'axios';
import BlocklyComponent from './BlocklyComponent';
import DisplayComponent from './DisplayComponent';
import Connect4 from './Connect4';
import TicTacToe from './TicTacToe';
import Mancala from './Mancala';

/*
Main Component that contains the main content section of the app
*/
function MainComponent() {
  const [code, setCode] = useState(''); //setting up a state for the generated code
  const [log, setLog] = useState('');
  const [logVisible, setLogVisible] = useState(true);
  const [codeVisible, setCodeVisible] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false); //state for showing the popup

  const codeHandler = (code) => { //this code handler will be passed into the BlocklyComponent, and will set the state of the code for the main component
    setCode(code);
  }

  const logHandler = (next) => {
    setLog((prev) => next + prev);
  }

  // Maintain both game selection methods for backward compatibility
  const [game, setGame] = useState(0);
  
  // Simple toggle between games (original functionality)
  const changeGame = async () => {
    if(game === 0) {
      setGame(1);
    }
    else {
      setGame(0);
    }
  };

  // Extended game selection by name (new functionality)
  const selectGame = async (newGame) => {
    if(newGame === 'tic') {
      setGame(0);
    }
    else if (newGame === 'connect') {
      setGame(1);
    }
    else if (newGame === 'mancala') {
      setGame(2);
    }
  };
  
  // Helper to get current game name
  const getCurrentGameName = () => {
    if (game === 0) return "tic";
    if (game === 1) return "connect";
    if (game === 2) return "mancala";
    return "tic";
  };

  // Toggle instructions popup
  const toggleInstructions = () => {
    setShowInstructions(prev => !prev);
  };
  
  // returns UI of main component (Blockly Component, Code Display, and Standard Output Display)
  return (
    <>
      <div className="controls">
        {/* Maintain both control types */}
        <button onClick={changeGame}>Change Game</button>
        
        <label style={{ marginLeft: '20px' }}>
          Choose Game:
          <select 
            value={getCurrentGameName()} 
            onChange={(e) => selectGame(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="tic">Tic-Tac-Toe</option>
            <option value="connect">Connect 4</option>
            <option value="mancala">Mancala</option>
          </select>
        </label>

        {/* New instructions button */}
        <button onClick={toggleInstructions} style={{ marginLeft: '20px' }}>
          Instructions
        </button>
      </div>

      {/* Instructions popup */}
      {showInstructions && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>How to Create a QUBO Model with Blocks</h2>
            <ul>
              <li>Use the QUBO Model block to set up the structure of the model.</li>
              <li>Use variable blocks to define quantum variables like spins and binaries.</li>
              <li>Add a constraint like <code>x0 + x1 + x2 + ... = 1</code> to allow one move.</li>
              <li>Set the objective function to assign constants to cells (e.g., <code>5 * x0 + 10 * x4</code>).</li>
              <li>Include a <strong>Return</strong> expression like <code>0 * x0 + 3 * x1 + 7 * x5</code>.</li>
              <li>Click "Generate Code" and test it with a game.</li>
            </ul>
            <button onClick={toggleInstructions}>Close</button>
          </div>
        </div>
      )}

      
      <div className="main">
        <div className="vertical-div">
          <div className={`blockly-container ${!codeVisible ? 'expanded' : ''}`}>
            <BlocklyComponent mainCodeHandlingFunction={codeHandler} log={logHandler}/>
          </div>
          
          <div className="code-container">
            <button 
              onClick={() => setCodeVisible(prev => !prev)} 
              className="toggle-log-btn"
            >
              {codeVisible ? 'Hide Code' : 'Show Code'}
            </button>

            {codeVisible && (
              <DisplayComponent heading="Generated Code" text={code} bColor='black'/>
            )}
          </div>
        </div>
        
        <div className="vertical-div">
          <div className={`game-container ${!logVisible ? 'expanded' : ''}`}>
            {game === 0 && (
              <TicTacToe quboCode={code} log={logHandler}/>
            )}
            {game === 1 && (
              <Connect4 quboCode={code} log={logHandler}/>
            )}
            {game === 2 && (
              <Mancala quboCode={code} log={logHandler}/>
            )}
          </div>
          
          <div className="log-container">
            <button 
              onClick={() => setLogVisible(prev => !prev)} 
              className="toggle-log-btn"
            >
              {logVisible ? 'Hide Log' : 'Show Log'}
            </button>

            {logVisible && (
              <DisplayComponent heading="Log" text={log} bColor='black' />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/*
Root Component that comprises the entire app
*/
function App() {
  // Add custom styling for game components
  useEffect(() => {
    // Only add styles if they don't already exist
    if (!document.getElementById('quantum-game-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'quantum-game-styles';
      styleEl.innerHTML = `
        .container {
          text-align: center;
          font-family: 'Arial', sans-serif;
          color: #333;
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 10px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          overflow: visible;
        }
        .ticboard {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 15px auto;
          width: 100%;
          max-width: 300px;
        }
        .cell {
          background-color: #ffeb3b;
          color: #333;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .cell:hover {
          background-color: #ffc107;
        }
        .turn-indicator {
          font-size: 1.2rem;
          margin: 10px 0;
          font-weight: bold;
          color: #2196f3;
        }
        .next-game-button {
          background-color: #ff9800;
          margin-top: 15px;
        }
        .board {
          display: grid;
          grid-template-columns: repeat(7, minmax(40px, 65px));
          grid-template-rows: repeat(6, minmax(40px, 65px));
          gap: 5px;
          margin: 15px auto;
          width: fit-content;
          justify-content: center;
        }
        .error-indicator {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          border-left: 5px solid #f5c6cb;
          width: 90%;
          max-width: 500px;
          text-align: left;
        }
        
        /* Media queries for better responsiveness */
        @media (max-width: 768px) {
          .board {
            grid-template-columns: repeat(7, minmax(35px, 55px));
            grid-template-rows: repeat(6, minmax(35px, 55px));
          }
          .cell {
            font-size: 1.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .board {
            grid-template-columns: repeat(7, minmax(30px, 45px));
            grid-template-rows: repeat(6, minmax(30px, 45px));
          }
          .cell {
            font-size: 1.5rem;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <>
      <h1>Quantum Blockly</h1>
      <MainComponent /> 
    </>
  );
}

export default App;