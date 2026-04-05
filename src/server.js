const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/db");
const { setSocketServer } = require("./config/socket");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);
  });
});

setSocketServer(io);

connectDatabase()
  .then(() => {
    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect database", error);
    process.exit(1);
  });
