import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Connect4.css';
//import './TicTacToe.css'; // Ensure CSS adjustments for scoreboard are included

const Connect4 = ({ quboCode, log }) => {
  const [gameSetup, setGameSetup] = useState(false);
  const [player1Type, setPlayer1Type] = useState('Human');
  const [player2Type, setPlayer2Type] = useState('CPU');
  const [player1Difficulty, setPlayer1Difficulty] = useState('Easy');
  const [player2Difficulty, setPlayer2Difficulty] = useState('Easy');
  const [unlockedDifficulties, setUnlockedDifficulties] = useState(['Easy']);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [cells, setCells] = useState(Array(42).fill(''));
  const [playerWins, setPlayerWins] = useState({ X: 0, O: 0 });
  const [turnIndicator, setTurnIndicator] = useState('');
  const [gameOver, setGameOver] = useState(false); // New state to track game end
  const [nextGameReady, setNextGameReady] = useState(false); // New state for next game prompt
  const [gameMode, setGameMode] = useState('Classic'); // Tracks the selected mode
  const [modeSelection, setModeSelection] = useState(true); // Track mode selection screen

  const MAX_WINS_DISPLAY = 3; // Max number of boxes to display wins
  const MOVE_DELAY = 1000; // Customizable delay in milliseconds, change as needed

  useEffect(() => {
    if (gameSetup && !gameOver) {
      if (currentPlayer === 'X' && player1Type === 'CPU') {
        setTurnIndicator('Player 1 (CPU) is making a move...');
        setTimeout(() => handleCPUMove(player1Difficulty), MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'CPU') {
        setTurnIndicator('Player 2 (CPU) is making a move...');
        setTimeout(() => handleCPUMove(player2Difficulty), MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'Quantum CPU') { 
        setTurnIndicator('Player 2 (Quantum CPU) is making a move...');
        setTimeout(fetchQuantumMove, MOVE_DELAY); // Use the same fetchQuantumMove logic
      } else if (currentPlayer === 'X' && player1Type === 'Quantum CPU') {
        setTurnIndicator('Player 1 (Quantum CPU) is making a move...');
        setTimeout(fetchQuantumMove, MOVE_DELAY);
      } else {
        setTurnIndicator(
          `It's ${currentPlayer === 'X' ? 'Player 1' : 'Player 2'}'s turn`
        );
      }
    }
  }, [currentPlayer, gameSetup, gameOver]);
  

  // Function to handle starting the game after setup
const startGame = () => {
  setGameSetup(true); // Transition to the game board
  setCells(Array(42).fill('')); // Reset board
  setCurrentPlayer('X');
  setTurnIndicator("It's Player 1's turn");
  setGameOver(false); // Reset game over state
  setNextGameReady(false); // Reset next game state
  log(`> ${gameMode} Mode started\n\n`);
};

// Function to handle mode selection
const handleModeSelection = (mode) => {
  setGameMode(mode);
  setModeSelection(false); // Move to setup screen
  log(`> ${mode} Mode selected\n\n`);
};


  const handleCellClick = (index) => {
    if (cells[index] || gameSetup === false || gameOver) return;

    if (
      (currentPlayer === 'X' && player1Type === 'Human') ||
      (currentPlayer === 'O' && player2Type === 'Human')
    ) {
      makeMove(index);
    }
  };

  const makeMove = (index, player = currentPlayer) => {
    while (index >= 7) {
        index -= 7;
    }

    while (!cells[index] && index <= 41) {
        index += 7;
    }
    index -= 7;

    if (!cells[index]) { 
        const newCells = [...cells];
        newCells[index] = player;
        setCells(newCells);
        log(`> Placed ${player} at cell ${index}\n\n`);
    
        if (checkWinner(index, newCells, player)) {
        setGameOver(true);
        setTimeout(() => {
            alert(`${player} wins!`);
            handleWin(player);
        }, 100); // Slight delay to allow rendering
        return; // Stop further game progression
        } else if (checkDraw(newCells)) {
        setGameOver(true);
        setTimeout(() => {
            alert("It's a draw!");
            prepareNextGame();
        }, 100);
        } else {
        setCurrentPlayer(player === 'X' ? 'O' : 'X');
        }
        
    
        saveGame({ cells: newCells, currentPlayer: player === 'X' ? 'O' : 'X' });
    }
  };

  const handleWin = (player) => {
    setPlayerWins((prevWins) => {
      const updatedWins = { ...prevWins, [player]: prevWins[player] + 1 };

      if (updatedWins[player] >= 2) {
        if (
          (player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
          (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Easy') ||
          (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
          (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Easy')
        ) {
          if (!unlockedDifficulties.includes('Medium')) {
            setUnlockedDifficulties((prev) => [...prev, 'Medium']);
            alert('Congratulations! "Medium" difficulty unlocked!');
          }
        } else if (
          (player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
          (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Medium') ||
          (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
          (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Medium')
        ) {
          if (!unlockedDifficulties.includes('Hard')) {
            setUnlockedDifficulties((prev) => [...prev, 'Hard']);
            alert('Congratulations! "Hard" difficulty unlocked!');
          }
        }

        // Automatically return to the main menu after winning 2/3 times
        setTimeout(() => {
          alert('The best-of-3 series is over! Returning to the main menu.');
          resetScoreboard(); // Reset the scoreboard
          resetToSetup();
        }, 1000);
      } else {
        setTimeout(prepareNextGame, 100); // Prepare for next game after win
      }

      return updatedWins;
    });
  };

  const resetScoreboard = () => {
    setPlayerWins({ X: 0, O: 0 }); // Reset the scoreboard
  };

  const prepareNextGame = () => {
    setNextGameReady(true);
  };

  const startNextGame = () => {
    resetBoard();
    setNextGameReady(false); // Hide the next game button
  };

  const resetBoard = () => {
    setCells(Array(42).fill(''));
    setCurrentPlayer('X');
    setTurnIndicator("It's Player 1's turn");
    setGameOver(false); // Allow new game to proceed
  };      

  const fetchQuantumMove = async () => {
    var createQuboForSingleMove = () => {};
  
    try {
      eval(quboCode);
  
      if (typeof createQuboForSingleMove !== 'function') {
        throw new Error("createQuboForSingleMove is not defined or not a function.");
      }
  
      const qubo = createQuboForSingleMove(cells);
      log('> QUBO Generated by Blockly Code\n\n');
  
      const response = await axios.post('http://localhost:8000/quantum', qubo);
  
      if (response.data && response.data.solution !== undefined && response.data.energy !== undefined) {
        makeMove(response.data.solution, currentPlayer); // Pass the current player dynamically
        log(
          `> Quantum Server calculated ${currentPlayer} placement at cell ${response.data.solution} based on QUBO generated from Blockly Workspace\n\n`
        );
      } else {
        log('> Quantum Server Error: Invalid response format or missing data.\n\n');
      }
    } catch (error) {
      console.error("Quantum Server Error:", error.message);
      log('> Quantum Server Error: QUBO format may be invalid, or server connection error occurred.\n\n');
    }
  };
  

  const handleCPUMove = (difficulty) => {
    const availableCells = cells
      .map((cell, index) => (cell === '' ? index : null))
      .filter((index) => index !== null);
  
    log(`> Available cells for CPU: ${availableCells}\n`);
    let chosenCell = null;
  
    if (difficulty === 'Easy') {
      // Easy: Random move
      chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      log(`> CPU (Easy) chose cell: ${chosenCell}\n`);
    } else if (difficulty === 'Medium') {
      // Medium: Check for winning or blocking moves first
      chosenCell = findStrategicMove(availableCells, cells, currentPlayer);
      if (chosenCell === null) {
        chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        log(`> CPU (Medium) chose random move: ${chosenCell}\n`);
      }
    } else if (difficulty === 'Hard') {
      chosenCell = findStrategicMove(availableCells, cells, currentPlayer);
      if (chosenCell === null) {
        chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      log(`> CPU (Hard) chose cell: ${chosenCell}\n`);
      }
    }
  
    makeMove(chosenCell);
  };
  
  const findStrategicMove = (availableCells, board, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
  
    for (let cell of availableCells) {
      let testBoard = [...board];
      testBoard[cell] = player;
      if (checkWinner(cell, testBoard, player)) {
        log(`> CPU (Medium) found winning move: ${cell}\n`);
        return cell;
      }
  
      testBoard = [...board];
      testBoard[cell] = opponent;
      if (checkWinner(cell, testBoard, opponent)) {
        log(`> CPU (Medium) found blocking move: ${cell}\n`);
        return cell;
      }
    }
    return null;
  };
  
  const getBestMove = (board, player) => { //fix this
    const opponent = player === 'X' ? 'O' : 'X';
  
    const minimax = (newBoard, currentPlayer) => {
      const availableCells = newBoard
        .map((cell, index) => (cell === '' ? index : null))
        .filter((index) => index !== null);
  
      if (checkWinner(minimax.index, newBoard, player)) {
        return { score: 1 };
      } else if (checkWinner(minimax.index, newBoard, opponent)) {
        return { score: -1 };
      } else if (availableCells.length === 0) {
        return { score: 0 }; // Draw
      }
  
      const moves = availableCells.map((cell) => {
        let testBoard = [...newBoard];
        testBoard[cell] = currentPlayer;
        const result = minimax(testBoard, currentPlayer === 'X' ? 'O' : 'X');
        return { index: cell, score: result.score };
      });
  
      return currentPlayer === player
        ? moves.reduce((best, move) => (move.score > best.score ? move : best), { score: -Infinity })
        : moves.reduce((best, move) => (move.score < best.score ? move : best), { score: Infinity });
    };
  
    return minimax(board, player).index;
  };
  
  const checkWinner = (index, board, player) => {
    const directions = [
        { r: 0, c: 1 },  // Horizontal
        { r: 7, c: 0 },  // Vertical
        { r: 7, c: 1 },  // Diagonal down-right
        { r: 7, c: -1 }  // Diagonal down-left
    ];

    for (let { r, c } of directions) {
        let count = 1;
        count += countConsecutive(index, r, c, board, player);
        count += countConsecutive(index, -r, -c, board, player);
        if (count >= 4) {
            return true;
        }
    }
    return false;
  };  

  function countConsecutive(index, rowDir, colDir, board, player) {
    if(index%7 === 0 && colDir === -1) {
        return 0;
    }
    if(index%7 === 6 && colDir === 1) {
        return 0;
    }
    let checkIndex = index + rowDir + colDir;
    let count = 0;
    while (checkIndex >= 0 && checkIndex <= 41 && board[checkIndex] === player) {
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
    return currentCells.every((cell) => cell);
  };

  const resetToSetup = () => {
    setCells(Array(42).fill(''));
    setCurrentPlayer('X');
    setGameSetup(false);
    setTurnIndicator('');
    setGameOver(false);
    setNextGameReady(false);
    setPlayerWins({ X: 0, O: 0 }); // Reset scores
  };

  const saveGame = (state) => {
    try {
      localStorage.setItem('connect4GameState', JSON.stringify(state));
      log('> Game state saved\n\n');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  const loadGame = () => {
    try {
      const savedState = localStorage.getItem('connect4GameState');
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  };

  const handleLoadGame = () => {
    const savedState = loadGame();
    if (savedState) {
      setCells(savedState.cells);
      setCurrentPlayer(savedState.currentPlayer);
      setGameSetup(true);
      log('> Game loaded from saved state\n\n');
    } else {
      alert('No saved game found.');
      log('> No saved game found\n\n');
    }
  };

  const clearSavedGame = () => {
    try {
      localStorage.removeItem('connect4GameState');
      alert('Saved game cleared.');
      log('> Saved game cleared\n\n');
    } catch (error) {
      console.error('Error clearing saved game:', error);
    }
  };

  const handlePlayerTypeChange = (player, newType) => {
    if (player === 'player1') {
      setPlayer1Type(newType);
    } else {
      setPlayer2Type(newType);
    }
    setPlayerWins({ X: 0, O: 0 }); // Reset scores when switching player type
  };

  const renderPlayerName = (playerType, playerDifficulty) => {
    if (playerType === 'CPU' || playerType === 'Quantum CPU') {
      return `${playerType} (${playerDifficulty})`;
    }
    return 'Human';
  };

  const renderScoreboard = (wins, player) => {
    const scoreBoxes = Array(MAX_WINS_DISPLAY)
      .fill(null)
      .map((_, index) => (index < wins ? `[${player}]` : `[]`));
    return <div className="scoreboard-row">{scoreBoxes.join(' ')}</div>;
  };

  const renderModeSelection = () => (
    <div className="mode-selection">
      <h2>Select Game Mode</h2>
      <button onClick={() => handleModeSelection('Classic Mode')}>Classic Mode</button>
      <button onClick={() => handleModeSelection('Game Mode')}>Game Mode</button>
    </div>
  );

  // Modify the difficulty dropdown rendering to enforce rules for Game Mode
const renderDifficultyOptions = (player) => {
  const playerDifficulty = player === 'player1' ? player1Difficulty : player2Difficulty;
  const handleChange = (e) =>
    player === 'player1'
      ? setPlayer1Difficulty(e.target.value)
      : setPlayer2Difficulty(e.target.value);

  const allowedDifficulties =
    gameMode === 'Game'
      ? unlockedDifficulties // Restrict difficulties based on unlocks
      : ['Easy', 'Medium', 'Hard'];

  return (
    <select value={playerDifficulty} onChange={handleChange}>
      {allowedDifficulties.map((difficulty) => (
        <option key={difficulty} value={difficulty}>
          {difficulty}
        </option>
      ))}
    </select>
  );
};

const resetToModeSelection = () => {
  setGameSetup(false);
  setModeSelection(true); // Return to mode selection
  setCells(Array(42).fill('')); // Clear the board
  setCurrentPlayer('X'); // Reset the current player
  setTurnIndicator('');
  setGameOver(false); // Reset game over state
  setNextGameReady(false); // Reset next game state
  setPlayer1Type('Human'); // Reset player types
  setPlayer2Type('CPU');
  setPlayer1Difficulty('Easy');
  setPlayer2Difficulty('Easy');
  setUnlockedDifficulties(['Easy']); // Reset unlocked difficulties
  setPlayerWins({ X: 0, O: 0 }); // Reset the scoreboard
  log('> Reset to mode selection\n\n');
};

// JSX for mode selection
if (modeSelection) {
  return (
    <div className="mode-selection">
      <h2>Select Game Mode</h2>
      <button onClick={() => handleModeSelection('Classic')}>Classic Mode</button>
      <button onClick={() => handleModeSelection('Game')}>Game Mode</button>
    </div>
  );
}
  
// Main rendering logic
return (
  <div className="container">
    <h1>Connect 4</h1>

    {/* Reset to Mode Selection Button */}
    <button
      onClick={resetToModeSelection}
      className="reset-mode-selection-button"
    >
      Return to Mode Selection
    </button>

    {modeSelection ? (
      <div className="mode-selection">
        <h2>Select Game Mode</h2>
        <button onClick={() => handleModeSelection('Classic')}>Classic Mode</button>
        <button onClick={() => handleModeSelection('Game')}>Game Mode</button>
      </div>
    ) : gameSetup ? (
      <>
        <div className="scoreboard">
          <div>Player 1 (X): {renderScoreboard(playerWins.X, 'X')}</div>
          <div>Player 2 (O): {renderScoreboard(playerWins.O, 'O')}</div>
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

        <p className="turn-indicator">{turnIndicator}</p>

        {nextGameReady && (
          <button onClick={startNextGame} className="next-game-button">
            Start Next Game
          </button>
        )}

        <div className="controls">
          <button onClick={resetToSetup}>Reset to Setup</button>
          <button onClick={() => saveGame({ cells, currentPlayer })}>Save</button>
          <button onClick={handleLoadGame}>Load</button>
          <button onClick={clearSavedGame}>Clear Save</button>
        </div>
      </>
    ) : (
      <div className="setup">
        <h2>{gameMode} Setup</h2>
        <label>
          Player 1 (X):
          <select value={player1Type} onChange={(e) => handlePlayerTypeChange('player1', e.target.value)}>
            <option value="Human">Human</option>
            <option value="CPU">CPU</option>
            <option value="Quantum CPU">Quantum CPU</option>
          </select>
        </label>
        {player1Type === 'CPU' && (
          <label>
            Player 1 CPU Difficulty:
            {renderDifficultyOptions('player1')}
          </label>
        )}
        <label>
          Player 2 (O):
          <select value={player2Type} onChange={(e) => handlePlayerTypeChange('player2', e.target.value)}>
            <option value="Human">Human</option>
            <option value="CPU">CPU</option>
            <option value="Quantum CPU">Quantum CPU</option>
          </select>
        </label>
        {player2Type === 'CPU' && (
          <label>
            Player 2 CPU Difficulty:
            {renderDifficultyOptions('player2')}
          </label>
        )}
        <button onClick={startGame}>Start Game</button>
      </div>
    )}
  </div>
);
};
export default Connect4;
