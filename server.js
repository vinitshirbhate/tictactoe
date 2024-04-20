const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.send(path.join(__dirname, "frontend", "dist", "index.html"));
});

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Adjust the origin accordingly
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Initialize game state
let gameData = {
  players: [],
  board: Array(9).fill(null),
  currentPlayer: null,
  winner: null,
};

// Function to check for a winner
function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((square) => square !== null)) {
    return "draw";
  }

  return null;
}

// Function to handle a player's move
function handleMove(playerId, squareIndex) {
  if (gameData.winner || gameData.board[squareIndex] !== null) {
    return;
  }

  if (gameData.players.length !== 2) {
    console.log("Waiting for another player to join...");
    return;
  }

  const player = gameData.players.find((p) => p.id === playerId);
  if (!player || player.id !== gameData.currentPlayer) {
    console.log("Not the player's turn or invalid player");
    return;
  }

  gameData.board[squareIndex] = player.symbol;
  const winner = calculateWinner(gameData.board);

  if (winner) {
    gameData.winner = winner;
  } else {
    gameData.currentPlayer =
      gameData.currentPlayer === gameData.players[0].id
        ? gameData.players[1].id
        : gameData.players[0].id;
  }

  io.emit("gameState", gameData);
}

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New player connected:", socket.id);

  // Add the player to the game
  gameData.players.push({
    id: socket.id,
    symbol: gameData.players.length === 0 ? "X" : "O",
  });

  // If both players are present, start the game
  if (gameData.players.length === 2) {
    gameData.currentPlayer = gameData.players[0].id;
  }

  // Send the initial game state to the player
  socket.emit("gameState", gameData);

  // Handle move from the player
  socket.on("move", (squareIndex) => {
    handleMove(socket.id, squareIndex);
  });

  socket.on("clearBoard", () => {
    gameData = {
      players: [],
      board: Array(9).fill(null),
      currentPlayer: null,
      winner: null,
    };
    io.emit("gameState", gameData);
    // socket.disconnect();
    // setTimeout(() => io.connect(), 1000);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    gameData.players = gameData.players.filter(
      (player) => player.id !== socket.id
    );
    gameData = {
      players: [],
      board: Array(9).fill(null),
      currentPlayer: null,
      winner: null,
    };
    io.emit("gameState", gameData);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
