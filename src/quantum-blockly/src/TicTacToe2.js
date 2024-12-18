import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TicTacToe.css';

const TicTacToe = ({ quboCode, log }) => {
  const [gameSetup, setGameSetup] = useState(false);
  const [player1Type, setPlayer1Type] = useState('Quantum CPU');
  const [player2Type, setPlayer2Type] = useState('Human');
  const [cpuDifficulty, setCpuDifficulty] = useState('Easy');
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [cells, setCells] = useState(Array(9).fill(''));
  const [quantumMoveMade, setQuantumMoveMade] = useState(false); // Track if Quantum CPU has made a move this turn

  const fetchQuantumMove = useCallback(async () => {
    if (quantumMoveMade) return; // Ensure this function only runs once per turn
    setQuantumMoveMade(true); // Set the flag to true to prevent further calls

    try {
      const quboFunction = new Function('cells', quboCode);
      const qubo = quboFunction(cells);
      log('> QUBO Generated by Blockly Code\n\n');

      const response = await axios.post('http://localhost:8000/quantum', qubo);

      if (response.data && response.data.solution !== undefined && response.data.energy !== undefined) {
        makeMove(response.data.solution, 'X');
        log(`> Quantum Server calculated X placement at cell ${response.data.solution} based on QUBO generated from Blockly Workspace\n\n`);
      } else {
        log('> Quantum Server Error: Invalid response format or missing data.\n\n');
      }
    } catch (error) {
      console.error("Quantum Server Error:", error.message);
      log('> Quantum Server Error: QUBO format may be invalid, or server connection error occurred.\n\n');
    }
  }, [quboCode, cells, log, quantumMoveMade]);

  const handleCPUMove = useCallback(() => {
    let selectedCell;

    if (cpuDifficulty === 'Easy') {
      selectedCell = getRandomMove();
    } else if (cpuDifficulty === 'Medium') {
      selectedCell = getMediumMove();
    } else if (cpuDifficulty === 'Hard') {
      selectedCell = getBestMove(currentPlayer);
    }

    makeMove(selectedCell);
  }, [cpuDifficulty, currentPlayer]);

  useEffect(() => {
    if (gameSetup) {
      if (currentPlayer === 'X' && player1Type === 'Quantum CPU') {
        fetchQuantumMove();
      } else if (currentPlayer === 'X' && player1Type === 'CPU') {
        handleCPUMove();
      } else if (currentPlayer === 'O' && player2Type === 'CPU') {
        handleCPUMove();
      }
    }
  }, [currentPlayer, gameSetup, fetchQuantumMove, handleCPUMove, player1Type, player2Type]);

  const startGame = () => {
    setGameSetup(true);
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setQuantumMoveMade(false); // Reset flag for a new game
    log('> Game started\n\n');
  };

  const handleCellClick = (index) => {
    if (cells[index] || gameSetup === false) return;

    if (
      (currentPlayer === 'X' && player1Type === 'Human') ||
      (currentPlayer === 'O' && player2Type === 'Human')
    ) {
      makeMove(index);
    }
  };

  const makeMove = (index, player = currentPlayer) => {
    const newCells = [...cells];
    newCells[index] = player;
    setCells(newCells);
    log(`> Placed ${player} at cell ${index}\n\n`);

    if (checkWinner(newCells)) {
      alert(`${player} wins!`);
      resetToSetup();
    } else if (checkDraw(newCells)) {
      alert("It's a draw!");
      resetToSetup();
    } else {
      setCurrentPlayer(player === 'X' ? 'O' : 'X');
      setQuantumMoveMade(false); // Reset Quantum move flag for the next turn
    }

    saveGame({ cells: newCells, currentPlayer: player === 'X' ? 'O' : 'X' });
  };

  const getRandomMove = () => {
    const availableCells = cells.map((cell, index) => (cell === '' ? index : null)).filter((index) => index !== null);
    return availableCells[Math.floor(Math.random() * availableCells.length)];
  };

  const getMediumMove = () => {
    const winningMove = findWinningMove(currentPlayer);
    const blockingMove = findWinningMove(currentPlayer === 'X' ? 'O' : 'X');

    if (winningMove !== null) {
      return winningMove;
    } else if (blockingMove !== null) {
      return blockingMove;
    } else {
      return getRandomMove();
    }
  };

  const findWinningMove = (player) => {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (cells[a] === player && cells[b] === player && cells[c] === '') return c;
      if (cells[a] === player && cells[c] === player && cells[b] === '') return b;
      if (cells[b] === player && cells[c] === player && cells[a] === '') return a;
    }
    return null;
  };

  const getBestMove = (player) => {
    const minimax = (newCells, isMaximizing) => {
      const winner = checkWinner(newCells);
      if (winner === 'X') return -1;
      if (winner === 'O') return 1;
      if (checkDraw(newCells)) return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newCells.length; i++) {
          if (newCells[i] === '') {
            newCells[i] = 'O';
            let score = minimax(newCells, false);
            newCells[i] = '';
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < newCells.length; i++) {
          if (newCells[i] === '') {
            newCells[i] = 'X';
            let score = minimax(newCells, true);
            newCells[i] = '';
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    };

    let bestMove;
    let bestScore = -Infinity;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === '') {
        cells[i] = player;
        let score = minimax(cells, player === 'O' ? false : true);
        cells[i] = '';
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const checkWinner = (board) => {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  };

  const checkDraw = (board) => board.every(cell => cell !== '');

  const resetToSetup = () => {
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setGameSetup(false);
    log('> Game reset to setup screen\n\n');
  };

  const saveGame = (state) => {
    localStorage.setItem('ticTacToeGameState', JSON.stringify(state));
    log('> Game state saved\n\n');
  };

  const handleLoadGame = () => {
    const savedState = localStorage.getItem('ticTacToeGameState');
    if (savedState) {
      const { cells, currentPlayer } = JSON.parse(savedState);
      setCells(cells);
      setCurrentPlayer(currentPlayer);
      setGameSetup(true);
      log('> Game loaded from saved state\n\n');
    } else {
      alert('No saved game found.');
      log('> No saved game found\n\n');
    }
  };

  const clearSavedGame = () => {
    localStorage.removeItem('ticTacToeGameState');
    alert('Saved game cleared.');
    log('> Saved game cleared\n\n');
  };

  return (
    <div className="container">
      <h1>Tic Tac Toe</h1>

      {gameSetup ? (
        <>
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

          <div className="controls">
            <button onClick={resetToSetup}>Reset to Setup</button>
            <button onClick={() => saveGame({ cells, currentPlayer })}>Save</button>
            <button onClick={handleLoadGame}>Load</button>
            <button onClick={clearSavedGame}>Clear Save</button>
          </div>
        </>
      ) : (
        <div className="setup">
          <h2>Choose Player Types</h2>
          <label>
            Player 1 (X):
            <select value={player1Type} onChange={(e) => setPlayer1Type(e.target.value)}>
              <option value="Human">Human</option>
              <option value="CPU">CPU</option>
              <option value="Quantum CPU">Quantum CPU</option>
            </select>
          </label>
          <label>
            Player 2 (O):
            <select value={player2Type} onChange={(e) => setPlayer2Type(e.target.value)}>
              <option value="Human">Human</option>
              <option value="CPU">CPU</option>
            </select>
          </label>
          {(player1Type === 'CPU' || player2Type === 'CPU') && (
            <label>
              Difficulty:
              <select value={cpuDifficulty} onChange={(e) => setCpuDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
          )}
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
