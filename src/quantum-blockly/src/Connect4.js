import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Connect4.css'; 
import { COLLAPSED_FIELD_NAME } from 'blockly';

const Connect4 = ({quboCode, log}) => {
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [cells, setCells] = useState(Array(42).fill(''));
  const [difficulty, setDifficulty] = useState('Easy');
  const [gamemode, setGamemode] = useState('PVC')

  useEffect(() => {
    const savedState = loadGame();
    if (savedState) {
      setCells(savedState.cells);
      setCurrentPlayer(savedState.currentPlayer);
      log('> Game loaded from saved state\n\n');
    }
  }, []);

  useEffect(() => {
    var createQuboForSingleMove = () => {};
    if (gamemode === 'PVC') {
        if (currentPlayer === 'O') {
            setTimeout(function(){
                if(difficulty === 'Easy') {
                    handleCellClick(Math.floor(Math.random() * 42));
                }
                else if(difficulty === 'Medium') {
                  if(Math.floor(Math.random() * 2) === 1) {
                    handleCellClick(Math.floor(Math.random() * 42));
                  }
                  else {
                    handleCellClick(makeHardMove);
                  }
                }
                else if(difficulty === 'Hard') {
                  handleCellClick(makeHardMove);
                }
            }, 400);
        }
    }
    else if (gamemode === 'QVC') {
        if (currentPlayer === 'O') {
            setTimeout(function(){
                if(difficulty === 'Easy') {
                  handleCellClick(Math.floor(Math.random() * 42));
                }
                else if(difficulty === 'Medium') {
                  if(Math.floor(Math.random() * 2) === 1) {
                    handleCellClick(Math.floor(Math.random() * 42));
                  }
                  else {
                    handleCellClick(makeHardMove);
                  }
                }
                else if(difficulty === 'Hard') {
                  handleCellClick(makeHardMove);
                }
            }, 400);
        }
        else if (currentPlayer === 'X') {
            setTimeout(function(){
                const fetchData = async () => {
                    try {
                      eval(quboCode);
                      const qubo = createQuboForSingleMove(cells);
                      log('> QUBO Generated by Blockly Code\n\n')
                      const response = await axios.post('http://localhost:8000/quantum', qubo); //make async post request to the server
                      if (response.data && response.data.solution !== undefined && response.data.energy !== undefined) {
                        setTimeout(() => { handleCellClick(response.data.solution); log(`> Quantum Server calculated O placement at cell ${response.data.solution} based on QUBO generated from Blockly Workspace\n\n`)}, 500);
                      } else {
                        // Handle the case where the expected property is not present in the response
                        log('> Quantum Server Error, QUBO is likely in an invalid format or code hasn`t been generated yet\n\n');
                      }
                    } catch(error) {
                        console.log(error.message);
                        log('> Quantum Server Error, QUBO is likely in an invalid format or code hasn`t been generated yet\n\n');
                    }
                  };
                  
                  fetchData();
            }, 400);
        }
    }
  }, [currentPlayer, cells])

  const makeHardMove = () => {
    handleCellClick(Math.floor(Math.random() * 42)); //add minimax here later
  };

  const handleCellClick = (index) => {
    while (index >= 7) {
        index -= 7;
    }

    while (!cells[index] && index <= 41) {
        index += 7;
    }
    index -= 7;

    if (!cells[index]) {
        
      const newCells = [...cells];
      newCells[index] = currentPlayer;
      setCells(newCells);
      log(`> Placed ${currentPlayer} at cell ${index}\n\n`);

      if (checkWinner(index)) {
        alert(`${currentPlayer} wins!`);
        resetBoard();
      } else if (checkDraw(newCells)) {
        alert("It's a draw!");
        resetBoard();
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    }
  };

  const checkWinner = (index) => {
    const directions = [
        { r: 0, c: 1 },  // Horizontal
        { r: 7, c: 0 },  // Vertical
        { r: 7, c: 1 },  // Diagonal down-right
        { r: 7, c: -1 }  // Diagonal down-left
    ];

    for (let { r, c } of directions) {
        let count = 1;
        count += countConsecutive(index, r, c);
        count += countConsecutive(index, -r, -c);
        if (count >= 4) {
            return true;
        }
    }
    return false;
  };

  function countConsecutive(index, rowDir, colDir) {
    if(index%7 === 0 && colDir === -1) {
        return 0;
    }
    if(index%7 === 6 && colDir === 1) {
        return 0;
    }
    let checkIndex = index + rowDir + colDir;
    let count = 0;
    while (checkIndex >= 0 && checkIndex <= 41 && cells[checkIndex] === currentPlayer) {
        count++;
        if(checkIndex%7 === 0 && colDir === -1) {
            return count;
        }
        if(checkIndex%7 === 6 && colDir === 1) {
            return count;
        }
        checkIndex += rowDir;
        checkIndex += colDir;
    }
    return count;
}

  const checkDraw = (currentCells) => {
    return currentCells.every(cell => cell);
  };

  const resetBoard = () => {
    setCells(Array(42).fill(''));
    setCurrentPlayer('X');
    log('> Board has been reset \n\n');
  };

  const saveGame = (state) => {
    localStorage.setItem('connect4GameState', JSON.stringify(state));
    log('> Game state saved\n\n');
  };

  const loadGame = () => {
    const savedState = localStorage.getItem('connect4GameState');
    return savedState ? JSON.parse(savedState) : null;
  };

  const handleLoadGame = () => {
    const savedState = loadGame();
    if (savedState) {
      setCells(savedState.cells);
      setCurrentPlayer(savedState.currentPlayer);
      log('> Game loaded from saved state\n\n');
    } else {
      alert('No saved game found.');
      log('> No saved game found\n\n');
    }
  };

  const clearSavedGame = () => {
    localStorage.removeItem('connect4GameState');
    alert('Saved game cleared.');
    log('> Saved game cleared\n\n');
  };


  return (
    <div className="container">
      <h1>Connect 4</h1>

      {/* Difficulty Selector */}
      <div className="difficulty">
        <label htmlFor="difficulty">Select Difficulty: </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => {
            const selectedDifficulty = e.target.value;
            if (window.confirm(`Change difficulty to ${selectedDifficulty}?`)) {
              setDifficulty(selectedDifficulty);
              resetBoard();
            }
          }}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Gamemode Selector */}
      <div className="gamemode">
        <label htmlFor="gamemode">Select Gamemode: </label>
        <select
          id="gamemode"
          value={gamemode}
          onChange={(e) => {
            const selectedGamemode = e.target.value;
            if (window.confirm(`Change Gamemode to ${selectedGamemode}?`)) {
              setGamemode(selectedGamemode);
              resetBoard();
            }
          }}
        >
          <option value="PVC">Player vs. Computer</option>
          <option value="QVC">Quantum Code vs. Computer</option>
        </select>
      </div>

      <div className="board">
        {cells.map((cell, index) => (
          <div
            key={index}
            className="cell"
            onClick={() => handleCellClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>
      {/* Control Buttons */}
      <div className="controls">
        <button onClick={resetBoard}>Reset</button>
        <button onClick={() => saveGame({ cells, currentPlayer })}>Save</button>
        <button onClick={handleLoadGame}>Load</button>
        <button onClick={clearSavedGame}>Clear Save</button>
      </div>
    </div>
  );
};

export default Connect4;
