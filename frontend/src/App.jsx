import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

function Square({ onSquareClick, value, shouldShake }) {
  const classShake = shouldShake ? "shake-lr" : "";
  return (
    <button
      className={`m-3 w-24 h-24 border-slate-500 border-2 rounded-lg hover:border-purple-500 text-white text-3xl font-bold ${classShake}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    players: [],
    board: Array(9).fill(null),
    currentPlayer: null,
    winner: null,
  });

  useEffect(() => {
    const newSocket = io("https://tictactoe-6b3h.onrender.com");
    setSocket(newSocket);

    newSocket.on("gameState", (gameData) => {
      setGameState(gameData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  function handleClick(i) {
    if (gameState.winner || gameState.board[i] !== null) {
      return;
    }
    socket.emit("move", i);
  }

  function handleClearBoard() {
    socket.emit("clearBoard");
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col justify-center items-center">
      <div className="text-3xl font-extrabold text-white mb-8 ">
        {gameState.winner
          ? "Winner: " + gameState.winner
          : gameState.board.every((square) => square !== null)
          ? "IT'S A TIE !!!"
          : gameState.players.length === 2
          ? gameState.currentPlayer === socket.id
            ? "Your Turn"
            : "Opponent's Turn"
          : "Waiting for Opponent"}
      </div>
      <div className="grid grid-col-3 col-span-9 grid-flow-col gap-1 sm:gap-4">
        <div className="grid grid-rows-3 grid-flow-col gap-1 sm:gap-4">
          <Square
            value={gameState.board[0]}
            onSquareClick={() => handleClick(0)}
            shouldShake={gameState.board[0] === gameState.winner}
          />
          <Square
            value={gameState.board[1]}
            onSquareClick={() => handleClick(1)}
            shouldShake={gameState.board[1] === gameState.winner}
          />
          <Square
            value={gameState.board[2]}
            onSquareClick={() => handleClick(2)}
            shouldShake={gameState.board[2] === gameState.winner}
          />
        </div>
        <div className="grid grid-rows-3 grid-flow-col gap-1 sm:gap-4">
          <Square
            value={gameState.board[3]}
            onSquareClick={() => handleClick(3)}
            shouldShake={gameState.board[3] === gameState.winner}
          />
          <Square
            value={gameState.board[4]}
            onSquareClick={() => handleClick(4)}
            shouldShake={gameState.board[4] === gameState.winner}
          />
          <Square
            value={gameState.board[5]}
            onSquareClick={() => handleClick(5)}
            shouldShake={gameState.board[5] === gameState.winner}
          />
        </div>
        <div className="grid grid-rows-3 grid-flow-col gap-1 sm:gap-4 ">
          <Square
            value={gameState.board[6]}
            onSquareClick={() => handleClick(6)}
            shouldShake={gameState.board[6] === gameState.winner}
          />
          <Square
            value={gameState.board[7]}
            onSquareClick={() => handleClick(7)}
            shouldShake={gameState.board[7] === gameState.winner}
          />
          <Square
            value={gameState.board[8]}
            onSquareClick={() => handleClick(8)}
            shouldShake={gameState.board[8] === gameState.winner}
          />
        </div>
      </div>
      {(gameState.winner ||
        gameState.board.every((square) => square !== null)) && (
        <div className="mt-8">
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold p-4 rounded-lg "
            onClick={handleClearBoard}
          >
            Clear Board
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
