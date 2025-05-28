import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  /* options */
  cors: {
    origin: "*", // 調整為你前端實際網址也可以
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  // ...
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on("joinroom", (userId) => {
    console.log(userId, "backend joinroom");
    socket.join(userId);
    io.to(userId).emit("joinroomtest", "Waya! What the heck is going on!");
  });

  // socket.on("drawline", (line) => {
  //   socket.broadcast.emit("drawline", line);
  // });

  socket.on("command", (command) => {
    // console.log(command);
    socket.broadcast.emit("command", command);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}/ ...`);
});
