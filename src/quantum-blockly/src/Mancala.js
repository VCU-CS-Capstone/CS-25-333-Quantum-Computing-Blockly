import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Mancala.css';

const Mancala = ({ quboCode, log }) => {
  const [gameSetup, setGameSetup] = useState(false);
  const [player1Type, setPlayer1Type] = useState('Human');
  const [player2Type, setPlayer2Type] = useState('CPU');
  const [player1Difficulty, setPlayer1Difficulty] = useState('Easy');
  const [player2Difficulty, setPlayer2Difficulty] = useState('Easy');
  const [unlockedDifficulties, setUnlockedDifficulties] = useState(['Easy']);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  /*const board = {
    player1: [4, 4, 4, 4, 4, 4],
    player2: [4, 4, 4, 4, 4, 4],
    player1Mancala: 0,
    player2Mancala: 0,
    currentPlayer: 1, // 1 for Player 1, 2 for Player 2
  };*/
  const [player1Board, setPlayer1Board] = useState([4, 4, 4, 4, 4, 4]);
  const [player2Board, setPlayer2Board] = useState([4, 4, 4, 4, 4, 4]);
  const [player1Mancala, setPlayer1Mancala] = useState(0);
  const [player2Mancala, setPlayer2Mancala] = useState(0);

  let testPlayer2Mancala = player2Mancala;
  let testPlayer1Mancala = player1Mancala;

  const [cells, setCells] = useState(Array(42).fill(''));
  const [playerWins, setPlayerWins] = useState({ X: 0, O: 0 });
  const [turnIndicator, setTurnIndicator] = useState('');
  const [gameOver, setGameOver] = useState(false); 
  const [nextGameReady, setNextGameReady] = useState(false); 
  const [gameMode, setGameMode] = useState('Classic'); 
  const [modeSelection, setModeSelection] = useState(true); 
  const [processingMove, setProcessingMove] = useState(false);
  const [quantumError, setQuantumError] = useState(null);

  const MAX_WINS_DISPLAY = 3; 
  const MOVE_DELAY = 1000; 

  // Helper function for server communication
  const sendQuboToServer = async (qubo) => {
    try {
      // Add detailed logging to see what's being sent
      console.log("QUBO payload being sent to server:", JSON.stringify(qubo, null, 2));
      
      // Check if qubo is null or undefined
      if (!qubo) {
        throw new Error("No QUBO model provided");
      }
      
      // Ensure required fields exist
      if (!qubo.variables) {
        throw new Error("QUBO model is missing variables");
      }
      
      if (!Array.isArray(qubo.Constraints)) {
        console.log("Fixing constraints array");
        qubo.Constraints = [];
      }
      
      if (!qubo.Objective) {
        throw new Error("QUBO model is missing an objective function");
      }
      
      if (!qubo.Return) {
        throw new Error("QUBO model is missing a return expression");
      }
      
      // Variables must be non-empty
      if (Object.keys(qubo.variables).length === 0) {
        throw new Error("QUBO model has empty variables object");
      }
      
      // Add timeout to prevent hanging
      const response = await axios.post('http://localhost:8000/quantum', qubo, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 seconds timeout
      });
      
      // Check response status
      console.log("Server response status:", response.status);
      console.log("Server response data:", JSON.stringify(response.data, null, 2));
      
      // Check for error in the response
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error("Server communication error:", error);
      console.error("Error details:", error.message);
      
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      // Get detailed error message
      let errorDetails = "Unknown error";
      
      if (error.response) {
        errorDetails = `Server error: ${
          error.response.data?.error || JSON.stringify(error.response.data)
        }`;
      } else if (error.request) {
        errorDetails = "Server did not respond. Is the server running?";
      } else {
        errorDetails = error.message;
      }
      
      return {
        status: 'error',
        error: errorDetails
      };
    }
  };

  // Format QUBO data for user-friendly display
  const formatQuboForLog = (quboData, currentBoard) => {
    if (!quboData) {
      return "No QUBO data received from server";
    }
    
    // Extract diagonal terms (variable weights)
    const columnWeights = {};
    const interactions = {};
    
    Object.keys(quboData.qubo).forEach(key => {
      if (key.includes("('x") && key.includes("')")) {
        // Parse the variables from the key
        const matches = key.match(/\('x(\d+)'(?:, 'x(\d+)')?\)/);
        if (matches) {
          const var1 = parseInt(matches[1]);
          const var2 = null;//matches[2] ? parseInt(matches[2]) : null;
          
          if (var2 === null && var1 < 7) {  // Only use the first 7 variables for columns
            // Convert negative weights to positive by taking absolute value
            columnWeights[var1] = Math.abs(quboData.qubo[key]);
            /*if(Math.abs(quboData.qubo[key]) > 9) {
              columnWeights[var1] = 9;
            }*/
          } else if (var1 < 7 && var2 < 7) {
            // This is an interaction term between columns
            if (!interactions[var1]) interactions[var1] = {};
            interactions[var1][var2] = quboData.qubo[key];
          }
        }
      }
    });
    
    // Format the output
    let output = "📊 QUBO Analysis for Connect4:\n";
    
    // If server provided explanations, use them
    if (quboData.explanation) {
      if (quboData.explanation.method) {
        output += `\n🔬 Method: ${quboData.explanation.method === "quantum_annealing" ? 
                  "Quantum Annealing" : "Alternative Solution"}\n`;
      }
      
      if (quboData.explanation.highlights && quboData.explanation.highlights.length > 0) {
        output += "\n💡 Insights:\n";
        quboData.explanation.highlights.forEach(highlight => {
          output += `   • ${highlight}\n`;
        });
      }
    }
    
    // Variable weights section
    output += "\n🎯 Column Weights (higher values are better):\n";
    
    // Sort from highest to lowest value
    const sortedColumns = Object.keys(columnWeights)
      .map(col => ({ column: parseInt(col), weight: columnWeights[col] }))
      .sort((a, b) => b.weight - a.weight); // Sort from highest to lowest
    
    sortedColumns.forEach(({ column, weight }, index) => {
      // Add star to highest value (best) option
      output += `   Column ${column}: ${weight.toFixed(1)}${index === 0 ? " ⭐" : ""}\n`;
    });
    
    // Add visual board representation
    output += "\n" + createConnect4Visual(columnWeights, currentBoard) + "\n";
    
    // Summarize the QUBO logic
    output += "\n🧠 QUBO Strategy Explanation:\n";
    output += "   • The algorithm assigns weights to each column\n";
    output += "   • Higher weight values are preferred (maximization problem)\n";
    output += "   • Interaction terms prevent selecting invalid columns\n";
    
    if (quboData.explanation && quboData.explanation.problem_type) {
      output += `   • Problem type: ${quboData.explanation.problem_type.replace(/_/g, " ")}\n`;
    }
    
    output += "\n🎲 Optimal Move:\n";
    if (sortedColumns.length > 0) {
      // Get the column with the highest weight (first in sorted array)
      const bestColumn = sortedColumns[0].column;
      const bestWeight = sortedColumns[0].weight;
      
      output += `   → Column ${bestColumn} with weight ${bestWeight.toFixed(1)}\n`;
    } else {
      output += "   → No optimal move found\n";
    }
    
    return output;
  };

  // Create a visual representation of Connect4 board with weights
  const createConnect4Visual = (weights, board) => {
    let visual = "   Connect4 Column Weights:\n";
    visual += "   ┌────┬────┬────┬────┬────┬────┬────┐\n";
    
    // Show weights in top row
    visual += "   │";
    for (let col = 0; col < 7; col++) {
      const weight = weights[col] !== undefined ? weights[col].toFixed(0) : " ";
      visual += ` ${weight} │`;
    }
    visual += "\n";
    visual += "   └────┴────┴────┴────┴────┴────┴────┘\n";
    
    // Show a simplified board representation (just a few rows)
    /*for (let row = 0; row < 3; row++) {
      visual += "   │";
      for (let col = 0; col < 7; col++) {
        const cellIdx = row * 7 + col;
        const cellContent = board[cellIdx] || " ";
        visual += ` ${cellContent} │`;
      }
      visual += "\n";
      
      if (row < 2) {
        visual += "   ├───┼───┼───┼───┼───┼───┼───┤\n";
      } else {
        visual += "   └───┴───┴───┴───┴───┴───┴───┘\n";
      }
    }*/
    
    return visual;
  };

  // Setup effect for player turns
  useEffect(() => {
    if (gameSetup && !gameOver && !nextGameReady) {
      // Prevent executing move logic if the game is already processing a move
      if (processingMove) return;
      
      if (currentPlayer === 'X' && player1Type === 'CPU') {
        setTurnIndicator('Player 1 (CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          handleCPUMove(player1Difficulty);
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'CPU') {
        setTurnIndicator('Player 2 (CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          handleCPUMove(player2Difficulty);
          setProcessingMove(false);
        }, MOVE_DELAY);
      } else if (currentPlayer === 'O' && player2Type === 'Quantum CPU') { 
        setTurnIndicator('Player 2 (Quantum CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          fetchQuantumMove();
        }, MOVE_DELAY);
      } else if (currentPlayer === 'X' && player1Type === 'Quantum CPU') {
        setTurnIndicator('Player 1 (Quantum CPU) is making a move...');
        setProcessingMove(true);
        setTimeout(() => {
          fetchQuantumMove();
        }, MOVE_DELAY);
      } else {
        setTurnIndicator(
          `It's ${currentPlayer === 'X' ? 'Player 1' : 'Player 2'}'s turn`
        );
      }
    }
  }, [currentPlayer, gameSetup, gameOver, processingMove, nextGameReady]);
  
  // Function to handle starting the game after setup
  const startGame = () => {
    // Clear any previous quantum errors
    setQuantumError(null);
    
    setGameSetup(true);
    setCells(Array(42).fill(''));
    setCurrentPlayer('X');
    setTurnIndicator("It's Player 1's turn");
    setGameOver(false);
    setNextGameReady(false);
    setProcessingMove(false);
    log(`> ${gameMode} Mode started\n\n`);
  };

  // Function to handle mode selection
  const handleModeSelection = (mode) => {
    setGameMode(mode);
    setModeSelection(false); // Move to setup screen
    log(`> ${mode} Mode selected\n\n`);
  };

  const handleCellClick = (player, index) => {
    if (gameSetup === false || gameOver || processingMove) return;

    if (currentPlayer === 'X' && player === 2) {
        return;
    }

    if (currentPlayer === 'O' && player === 1) {
        return;
    }

    if (
      (currentPlayer === 'X' && player1Type === 'Human') ||
      (currentPlayer === 'O' && player2Type === 'Human')
    ) {
        if (currentPlayer === 'X') {
            makeMove(1, index);
        }
        else if (currentPlayer === 'O') {
            if (index === 0) {
                makeMove(2, 5);
            }
            else if (index === 1) {
                makeMove(2, 4);
            }
            else if (index === 2) {
                makeMove(2, 3);
            }
            else if (index === 3) {
                makeMove(2, 2);
            }
            else if (index === 4) {
                makeMove(2, 1);
            }
            else if (index === 5) {
                makeMove(2, 0);
            }
        }
    }
  };

  const makeMove = (player, index) => {
    const mancalaPlayer = player === 1 ? player1Board : player2Board;
    const opponent = player === 1 ? player2Board : player1Board;

    let seedsToMove = mancalaPlayer[index];
    if (seedsToMove === 0) return; // No seeds to move in this pit

    mancalaPlayer[index] = 0; // Empty the selected pit

    let currentIndex = index + 1; // Start placing seeds in the next pit
    let lastStoneInMancala = false;
    let capturedStones = 0;
    let landedInEmptyPit = false;
    let oppositeIndex = -1;

    // Distribute the seeds
    while (seedsToMove > 0) {
        if (currentIndex === 6) {
            // Place in Player's Mancala (Player 1 or Player 2)
            if (player === 1) {
                setPlayer1Mancala(player1Mancala+1);
                testPlayer1Mancala++;
                if (seedsToMove === 1) lastStoneInMancala = true;
            } else {
                setPlayer2Mancala(player2Mancala+1);
                testPlayer2Mancala++;
                if (seedsToMove === 1) lastStoneInMancala = true;
            }
        } else if (currentIndex === 13) {
            // Skip opponent's Mancala
            currentIndex = 0;
            continue;
        } else if (currentIndex > 5) {
            // Opponent's side (distribute seeds here)
            opponent[currentIndex - 7]++;
        } else {
            // Player's side (distribute seeds here)
            mancalaPlayer[currentIndex]++;
        }

        seedsToMove--;
        currentIndex++;
        if (currentIndex > 13) currentIndex = 0; // Wrap around the board
    }

    // After distributing, check if last stone landed in an empty pit on the player's side
    currentIndex--;
    if (currentIndex <= 5 && mancalaPlayer[currentIndex] === 1) {
        landedInEmptyPit = true;
        oppositeIndex = 5 - currentIndex; // The opposite pit on the opponent's side

        // Check if the opposite pit has seeds to capture
        if (opponent[oppositeIndex] > 0) {
            // Capture the seeds in the opposite pit and the last stone
            capturedStones = opponent[oppositeIndex] + 1; // Opponent's seeds + the last stone
            mancalaPlayer[currentIndex] = 0; // Clear the current pit
            opponent[oppositeIndex] = 0; // Clear the opposite pit

            // Add the captured stones to the player's Mancala
            if (player === 1) {
                setPlayer1Mancala(player1Mancala+capturedStones);
                testPlayer1Mancala += capturedStones;
            } else {
                setPlayer2Mancala(player2Mancala+capturedStones);
                testPlayer2Mancala += capturedStones;
            }

            // Update the board and check for game status after the capture
            checkGameStatus();
            setCurrentPlayer(player === 1 ? 'O' : 'X');
            return; // End the function after capturing
        }
    }

    // If the last stone landed in a Mancala, the player gets another turn
    if (lastStoneInMancala) {
        checkGameStatus();
        return; // Extra turn, no player switch
    }

    checkGameStatus();
    // Switch player turn
    setCurrentPlayer(player === 1 ? 'O' : 'X');
  };

  const checkGameStatus = () => {
    
    const player1Empty = player1Board.every(seeds => seeds === 0);
    const player2Empty = player2Board.every(seeds => seeds === 0);
    
    if (player1Empty || player2Empty) {
        // Move any remaining stones to the Mancala

        if (player1Empty) {
            setPlayer2Mancala(player2Mancala + (player2Board.reduce((sum, seeds) => sum + seeds, 0)));
            testPlayer2Mancala += (player2Board.reduce((sum, seeds) => sum + seeds, 0))
            setPlayer2Board([0,0,0,0,0,0]);
        } else {
            setPlayer1Mancala(player1Mancala + (player1Board.reduce((sum, seeds) => sum + seeds, 0)));
            testPlayer1Mancala += (player1Board.reduce((sum, seeds) => sum + seeds, 0))
            setPlayer1Board([0,0,0,0,0,0]);
        }

        if(testPlayer1Mancala > testPlayer2Mancala) {
            setGameOver(true);
            setTimeout(() => {
                alert(`Player 1 wins!`);
                handleWin('X');
            }, 100);
        }
        else if(testPlayer1Mancala < testPlayer2Mancala) {
            setGameOver(true);
            setTimeout(() => {
                alert(`Player 2 wins!`);
                handleWin('O');
            }, 100);
        }
        else {
            setGameOver(true);
            setTimeout(() => {
                alert("It's a draw!");
                prepareNextGame();
              }, 100);
        }
    }
  };

  const handleWin = (player) => {
    setPlayerWins((prevWins) => {
      const updatedWins = { ...prevWins, [player]: prevWins[player] + 1 };

      if (updatedWins[player] >= MAX_WINS_DISPLAY) {
        // Handle difficulty unlocks
        const shouldUnlockMedium = !unlockedDifficulties.includes('Medium') && (
          (player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
          (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Easy') ||
          (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Easy') ||
          (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Easy')
        );

        const shouldUnlockHard = !unlockedDifficulties.includes('Hard') && (
          (player === 'X' && player1Type === 'Human' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
          (player === 'O' && player2Type === 'Human' && player1Type === 'CPU' && player1Difficulty === 'Medium') ||
          (player === 'X' && player1Type === 'Quantum CPU' && player2Type === 'CPU' && player2Difficulty === 'Medium') ||
          (player === 'O' && player2Type === 'Quantum CPU' && player1Type === 'CPU' && player1Difficulty === 'Medium')
        );

        if (shouldUnlockMedium) {
          setUnlockedDifficulties(prev => [...prev, 'Medium']);
          alert('Congratulations! "Medium" difficulty unlocked!');
        } else if (shouldUnlockHard) {
          setUnlockedDifficulties(prev => [...prev, 'Hard']);
          alert('Congratulations! "Hard" difficulty unlocked!');
        }

        // Reset after best-of-3 series
        setTimeout(() => {
          alert('The best-of-3 series is over! Returning to the main menu.');
          resetScoreboard();
          resetToSetup();
        }, 1000);
      } else {
        // Prepare for next game if series isn't over
        setTimeout(prepareNextGame, 100);
      }

      return updatedWins;
    });
  };

  const resetScoreboard = () => {
    setPlayerWins({ X: 0, O: 0 });
  };

  const prepareNextGame = () => {
    setNextGameReady(true);
  };

  const startNextGame = () => {
    // Create a completely fresh board first
    setPlayer1Board([4, 4, 4, 4, 4, 4]);
    setPlayer2Board([4, 4, 4, 4, 4, 4]);
    setPlayer1Mancala(0);
    setPlayer2Mancala(0);

    testPlayer2Mancala = 0;
    testPlayer1Mancala = 0;
        
    // Use a single timeout to delay all the remaining state changes
    setTimeout(() => {
      // Apply all these changes together
      setCurrentPlayer('X');
      setTurnIndicator("It's Player 1's turn");
      setNextGameReady(false);
      setQuantumError(null);
      
      // Add one final delay before releasing game locks
      setTimeout(() => {
        // CRITICAL: Only release these at the very end, and with enough delay
        setProcessingMove(false);
        setGameOver(false);
        log(`> New game started\n\n`);
      }, 100);
    }, 150);
  };

  // Enhanced fetchQuantumMove function for Connect4
const fetchQuantumMove = async () => {
  // If already processing a move or game is over, exit early
  if (gameOver || nextGameReady) {
    console.log("Quantum move prevented - game state doesn't allow moves");
    setProcessingMove(false);
    return;
  }
  
  setQuantumError(null);
  let availableCells = [];

  try {
    // Define available cells first
    availableCells = cells
      .map((cell, index) => (cell === '' ? index : null))
      .filter((index) => index !== null);

    if (availableCells.length === 0) {
      log('> No available moves to make\n\n');
      setProcessingMove(false);
      return;
    }

    // Basic validation of QUBO code
    if (!quboCode || typeof quboCode !== "string" || quboCode.trim() === '') {
      throw new Error("No Blockly code found. Please create a QUBO model first.");
    }

    // Check if code contains the required function
    if (!quboCode.includes('createQuboForSingleMove')) {
      throw new Error("Function 'createQuboForSingleMove' not found in your code.");
    }
    
    log('> Evaluating your quantum algorithm...\n\n');

    // Create function in a safer way
    const functionCreator = new Function('board', `
      try {
        ${quboCode}
        return typeof createQuboForSingleMove === 'function' ? createQuboForSingleMove : null;
      } catch (err) {
        console.error("Function evaluation error:", err);
        return null;
      }
    `);
    
    const createQuboForSingleMove = functionCreator(cells);

    if (typeof createQuboForSingleMove !== 'function') {
      throw new Error("Could not create a valid function from your code");
    }

    // Get QUBO data
    let qubo;
    try {
      qubo = createQuboForSingleMove(cells);
      console.log("QUBO data returned from function:", JSON.stringify(qubo, null, 2));
      
      // Validate QUBO
      if (!qubo || typeof qubo !== 'object') {
        throw new Error("Your algorithm must return a valid QUBO object");
      }
      
      // Ensure the QUBO has the correct format
      if (!qubo.variables || Object.keys(qubo.variables).length === 0) {
        throw new Error("No variables defined in your QUBO model");
      }
      
      // Fix missing Return expression
      if (!qubo.Return || typeof qubo.Return !== 'string' || qubo.Return.trim() === '') {
        const returnTerms = [];
        Object.keys(qubo.variables).forEach(varName => {
          const index = varName.replace('x', '');
          returnTerms.push(`${index} * ${varName}`);
        });
        qubo.Return = returnTerms.join(" + ");
        console.log("Added default Return expression:", qubo.Return);
      }
    } catch (quboError) {
      console.error("Error getting QUBO data:", quboError);
      throw new Error(`Error when running your algorithm: ${quboError.message}`);
    }

    // Send QUBO to server
    log("> Sending quantum problem to solver...\n\n");
    console.log("Final QUBO data being sent:", JSON.stringify(qubo, null, 2));

    const serverResult = await sendQuboToServer(qubo);

    // Handle error response from server
    if (serverResult.status === 'error') {
      throw new Error(serverResult.error || "Unknown server error");
    }

    const responseData = serverResult.data;

    // Check for essential response properties
    if (!responseData) {
      throw new Error("Server returned an invalid response");
    }

    // Log the full response for debugging
    log(`> Full server response: ${JSON.stringify(responseData)}\n\n`);

    // Display the formatted QUBO data for educational purposes
    log(`> Received quantum solution\n\n`);
    //log(formatQuboForLog(responseData, cells) + "\n\n");

    // SIMPLIFIED CELL SELECTION LOGIC - Use only the primary method
    let bestCell = null;
    
    // Only use the 'return' value if it's an integer cell index
    if (responseData.return !== undefined && 
        !isNaN(parseInt(responseData.return)) && 
        cells[parseInt(responseData.return)] === '') {
        
      bestCell = parseInt(responseData.return);
      log(`> Quantum algorithm selected cell ${bestCell}\n\n`);
    } else {
      throw new Error("Could not determine a valid move from the quantum solution");
    }
    
    if(bestCell > 5) {
      bestCell = 5;
    }
    // Make the chosen move
    if (currentPlayer === 'X') {
      if (player1Board[bestCell] === 0) {
        makeMove(1, (Math.floor(Math.random() * 6)));
      }
      makeMove(1, bestCell);
  }
  else {
    if (player2Board[bestCell] === 0) {
      makeMove(2, (Math.floor(Math.random() * 6)));
    }
      makeMove(2, bestCell);
  }
    

  } catch (error) {
    console.error("Quantum Move Error:", error);
    
    log(`> ⚠️ Quantum Algorithm Error: ${error.message}\n`);
    log(`> Game cannot proceed. Please fix your code and try again.\n\n`);
    
    setQuantumError(error.message);
    
    setTimeout(() => {
      resetToSetup();
    }, 1000);
  } finally {
    setProcessingMove(false);
  }
};

  const handleCPUMove = (difficulty) => {
    /*const availableColumns = [];
    for (let col = 0; col < 7; col++) {
      let isFull = true;
      // Check if column has any empty spaces
      for (let row = 0; row < 6; row++) {
        const cellIndex = row * 7 + col;
        if (cells[cellIndex] === '') {
          isFull = false;
          break;
        }
      }
      if (!isFull) {
        availableColumns.push(col);
      }
    }
  
    if (availableColumns.length === 0) {
      console.log("No available columns for CPU move");
      return;
    }
    
    log(`> Available columns for CPU: ${availableColumns.join(',')}\n`);
    let chosenColumn = null;
  
    if (difficulty === 'Easy') {
      // Easy: Random move
      chosenColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
      log(`> CPU (Easy) chose column: ${chosenColumn}\n`);
    } else if (difficulty === 'Medium') {
      // Medium: Check for winning or blocking moves first
      chosenColumn = findStrategicMove(availableColumns);
      if (chosenColumn === null) {
        chosenColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        log(`> CPU (Medium) chose random column: ${chosenColumn}\n`);
      }
    } else if (difficulty === 'Hard') {
      // Hard: Minimax-like strategy with better heuristics
      chosenColumn = findBestMove(availableColumns);
      log(`> CPU (Hard) chose column: ${chosenColumn}\n`);
    }
  
    makeMove(chosenColumn);*/

    if (currentPlayer === 'X') {
        makeMove(1, (Math.floor(Math.random() * 6)));
    }
    else {
        makeMove(2, (Math.floor(Math.random() * 6)));
    }
  };
  
  const findStrategicMove = (availableColumns) => {
    const player = currentPlayer;
    const opponent = player === 'X' ? 'O' : 'X';
  
    // For each column, check if placing a piece there would result in a win
    for (let col of availableColumns) {
      // Find where the piece would land in this column
      let landingRow = -1;
      for (let row = 5; row >= 0; row--) {
        const cellIndex = row * 7 + col;
        if (cells[cellIndex] === '') {
          landingRow = row;
          break;
        }
      }
      
      const landingCellIndex = landingRow * 7 + col;
      
      // Check for winning move
      const testBoardWin = [...cells];
      testBoardWin[landingCellIndex] = player;
      if (checkWinner(landingCellIndex, testBoardWin, player)) {
        log(`> CPU found winning move: column ${col}\n`);
        return col;
      }
      
      // Check for blocking move
      const testBoardBlock = [...cells];
      testBoardBlock[landingCellIndex] = opponent;
      if (checkWinner(landingCellIndex, testBoardBlock, opponent)) {
        log(`> CPU found blocking move: column ${col}\n`);
        return col;
      }
    }
    
    // If no winning or blocking move, prefer the center column
    if (availableColumns.includes(3)) {
      return 3;
    }
    
    return null;
  };
  
  const findBestMove = (availableColumns) => {
    // Advanced heuristic:
    // 1. Check for immediate win
    // 2. Check for block of opponent's win
    // 3. Prefer center and then columns adjacent to center
    // 4. Avoid setting up opponent wins
    
    const strategicMove = findStrategicMove(availableColumns);
    if (strategicMove !== null) {
      return strategicMove;
    }
    
    // Score columns with heuristics
    const columnScores = {};
    availableColumns.forEach(col => {
      // Start with a base score
      columnScores[col] = 0;
      
      // Prefer center column (3) and then columns closer to center
      const distanceFromCenter = Math.abs(col - 3);
      columnScores[col] += (4 - distanceFromCenter) * 2;
      
      // Find where the piece would land
      let landingRow = -1;
      for (let row = 5; row >= 0; row--) {
        const cellIndex = row * 7 + col;
        if (cells[cellIndex] === '') {
          landingRow = row;
          break;
        }
      }
      
      const landingCellIndex = landingRow * 7 + col;
      
      // Check if this move would set up opponent for a win
      if (landingRow > 0) { // If not the top row
        const testBoard = [...cells];
        testBoard[landingCellIndex] = currentPlayer;
        
        // Check the cell above our move (opponent's potential next move)
        const opponentCellIndex = (landingRow - 1) * 7 + col;
        testBoard[opponentCellIndex] = currentPlayer === 'X' ? 'O' : 'X';
        
        // If opponent would win, assign a very negative score
        if (checkWinner(opponentCellIndex, testBoard, currentPlayer === 'X' ? 'O' : 'X')) {
          columnScores[col] -= 50;
        }
      }
      
      // Evaluate potential connections
      const connectionsScore = evaluateConnections(cells, col, landingRow, currentPlayer);
      columnScores[col] += connectionsScore * 3;
    });
    
    // Find the column with the best score
    let bestCol = availableColumns[0];
    let bestScore = columnScores[bestCol];
    
    for (const col of availableColumns) {
      if (columnScores[col] > bestScore) {
        bestScore = columnScores[col];
        bestCol = col;
      }
    }
    
    return bestCol;
  };
  
  const evaluateConnections = (board, col, row, player) => {
    // Calculate how many potential connections can be made
    let score = 0;
    const cellIndex = row * 7 + col;
    
    // Create a test board with the piece placed
    const testBoard = [...board];
    testBoard[cellIndex] = player;
    
    // Directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      { dr: 0, dc: 1 },  // horizontal
      { dr: 1, dc: 0 },  // vertical
      { dr: 1, dc: 1 },  // diagonal down-right
      { dr: 1, dc: -1 }  // diagonal down-left
    ];
    
    for (const dir of directions) {
      let count = 1;  // Start with 1 for the current piece
      let hasPotential = false;
      
      // Check in both directions
      for (const mult of [1, -1]) {
        for (let i = 1; i <= 3; i++) {
          const r = row + dir.dr * i * mult;
          const c = col + dir.dc * i * mult;
          
          // Check bounds
          if (r < 0 || r >= 6 || c < 0 || c >= 7) break;
          
          const idx = r * 7 + c;
          if (testBoard[idx] === player) {
            count++;
          } else if (testBoard[idx] === '') {
            hasPotential = true;
            break;
          } else {
            break;
          }
        }
      }
      
      // Score based on how many pieces are connected
      if (count >= 2 && hasPotential) {
        if (count === 2) score += 1;
        if (count === 3) score += 5;
      }
    }
    
    return score;
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
    setPlayer1Board([4, 4, 4, 4, 4, 4]);
    setPlayer2Board([4, 4, 4, 4, 4, 4]);
    setPlayer1Mancala(0);
    setPlayer2Mancala(0);

    testPlayer2Mancala = 0;
    testPlayer1Mancala = 0;
    
    setCurrentPlayer('X');
    setGameSetup(false);
    setTurnIndicator('');
    setGameOver(false);
    setNextGameReady(false);
    setPlayerWins({ X: 0, O: 0 }); 
    setProcessingMove(false);
    setQuantumError(null);
    log('> Reset to setup\n\n');
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
    setProcessingMove(false); // Reset the processing flag
    setQuantumError(null); // Clear quantum errors
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
      <h1>Mancala</h1>

      {/* Reset to Mode Selection Button */}
      <button
        onClick={resetToModeSelection}
        className="reset-mode-selection-button"
      >
        Return to Mode Selection
      </button>

      {gameSetup ? (
        <>
          <div className="scoreboard">
            <div>Player 1 : {renderScoreboard(playerWins.X, 'X')}</div>
            <div>Player 2 : {renderScoreboard(playerWins.O, 'O')}</div>
          </div>

          {/* Display quantum error if one occurred */}
          {quantumError && (
            <div className="error-indicator">
              <span style={{ fontWeight: 'bold' }}>⚠️ Quantum Algorithm Error</span>
              <p>Your quantum algorithm encountered an error: {quantumError}</p>
              <p>Please check your code and fix the issue before trying again.</p>
            </div>
          )}

          {/* Processing indicator when quantum algorithm is running */}
          {processingMove && ((currentPlayer === 'O' && player2Type === 'Quantum CPU') || 
                             (currentPlayer === 'X' && player1Type === 'Quantum CPU')) && (
            <div className="processing-indicator">
              <span>🔄 Quantum algorithm is processing...</span>
            </div>
          )}

          {/* Board with responsive styling */}
          <div className="board-container">
            <div className="mancala2">
                <p>{player2Mancala}</p>
            </div>
            <div className="board">
                <div className="board2">
                {player2Board.toReversed().map((cell, index) => (
                    <div
                    key={index}
                    className="cell2"
                    onClick={() => handleCellClick(2, index)}
                    >
                    {cell}
                    </div>
                ))}
                </div>
                <div className="board1">
                {player1Board.map((cell, index) => (
                    <div
                    key={index}
                    className="cell1"
                    onClick={() => handleCellClick(1, index)}
                    >
                    {cell}
                    </div>
                ))}
                </div>
            </div>
            <div className="mancala1">
              <p>{player1Mancala}</p>
              </div>
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
            Player 1 :
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
            Player 2 :
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

export default Mancala;