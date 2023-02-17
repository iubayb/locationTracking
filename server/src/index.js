const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const port = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to my web socket");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Initialize the array of connected agents
let agents = [];

io.on("connection", (client) => {
  console.log("New agent connection", client.id);

  // Add the new agent to the array
  agents.push({ id: client.id, name: "" });

  // Send the list of agents to the client
  client.emit("agent-list", agents);

  client.on("set-agent-name", (name) => {
    // Update the agent name in the array
    const agent = agents.find((agent) => agent.id === client.id);
    if (agent) {
      agent.name = name;
    }
  });

  client.on("position-change", (data) => {
    console.log(data);
    client.broadcast.emit("position-change", data);
  });

  client.on("disconnect", () => {
    console.log("Agent disconnect");
    // Remove the agent from the array
    agents = agents.filter((agent) => agent.id !== client.id);
  });
});

server.listen(port, () => {
  console.clear();
  console.log(`Server is up at port ${port}!`);
});
