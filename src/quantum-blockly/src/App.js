import './App.css'
import {useState, useEffect} from 'react';
import axios from 'axios';
import BlocklyComponent from './BlocklyComponent';
import DisplayComponent from './DisplayComponent';
import Connect4 from './Connect4';
import TicTacToe from './TicTacToe';

/*
Main Component that contains the main content section of the app
*/
function MainComponent() {
  const [code, setCode] = useState(''); //setting up a state for the generated code
  const [log, setLog] = useState('');

  const codeHandler = (code) => { //this code handler will be passed into the BlocklyComponent, and will set the state of the code for the main component
    setCode(code);
  }

  const logHandler = (next) => {
    setLog((prev) => next + prev);
  }

  const [game, setGame] = useState(0);
  
  const changeGame = async (newGame) => {
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
  
  // returns UI of main component (Blockly Component, Code Display, and Standard Output Display)
  if(game === 0) {
    return (
      <>
      <div className="controls">
        <label>
          Choose Game :
          <select value={game} onChange={(e) => changeGame(e.target.value)}>
            <option value="tic">Tic-Tac-Toe</option>
            <option value="connect">Connect 4</option>
            <option value="mancala">Mancala</option>
          </select>
        </label>
        </div>
      <div className="main">
        <div className="vertical-div">
          <BlocklyComponent mainCodeHandlingFunction={codeHandler} log={logHandler}/>
          <DisplayComponent heading="Generated Code" text={code} bColor='black'/>
        </div>
        <div className="vertical-div" >
          <div style={{height:'50%'}}>
            <TicTacToe quboCode={code} log={logHandler}/>
          </div>
          <div style={{width: '90%', height:'50%'}}>
            <DisplayComponent heading="Log" text={log} bColor='black' />
          </div>
          
        </div>
      </div>
      </>
    )
  }
  else if (game === 1) {
    return (
      <>
      <div className="controls">
        <label>
          Choose Game :
          <select value={game} onChange={(e) => changeGame(e.target.value)}>
            <option value="connect">Connect 4</option>
            <option value="tic">Tic-Tac-Toe</option>
            <option value="mancala">Mancala</option>
          </select>
        </label>
        </div>
      <div className="main">
        <div className="vertical-div">
          <BlocklyComponent mainCodeHandlingFunction={codeHandler} log={logHandler}/>
          <DisplayComponent heading="Generated Code" text={code} bColor='black'/>
        </div>
        <div className="vertical-div" >
          <div style={{height:'50%'}}>
            <Connect4 quboCode={code} log={logHandler}/>
          </div>
          <div style={{width: '90%', height:'50%'}}>
            <DisplayComponent heading="Log" text={log} bColor='black' />
          </div>
          
        </div>
      </div>
      </>
    )
  }
  else if (game === 2) {
    return (
      <>
      <div className="controls">
        <label>
          Choose Game :
          <select value={game} onChange={(e) => changeGame(e.target.value)}>
            <option value="mancala">Mancala</option>
            <option value="tic">Tic-Tac-Toe</option>
            <option value="connect">Connect 4</option>
          </select>
        </label>
        </div>
      <div className="main">
        <div className="vertical-div">
          <BlocklyComponent mainCodeHandlingFunction={codeHandler} log={logHandler}/>
          <DisplayComponent heading="Generated Code" text={code} bColor='black'/>
        </div>
        <div className="vertical-div" >
          <div style={{height:'50%'}}>
            <h2>Placeholder</h2>
          </div>
          <div style={{width: '90%', height:'50%'}}>
            <DisplayComponent heading="Log" text={log} bColor='black' />
          </div>
          
        </div>
      </div>
      </>
    )
  }

}

/*
Root Component that comprises the entire app
*/
function App() {

  return (
    <>
    <h1>Quantum Blockly</h1>
    <MainComponent /> 
    </>
  );
}

export default App;
