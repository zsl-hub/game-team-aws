const dotenv = require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { gameBackend, gameRouter } = require("./controllers/gameController.js")

const app = express();

//routers
const lobbyRouter = require("./controllers/lobbyController");
gameBackend();

app.listen(3000);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.use("/game", gameRouter);
app.use("/lobby", lobbyRouter);
