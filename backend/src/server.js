const dotenv = require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

//routers
const lobbyRouter = require("./controllers/lobbyController");

app.listen(3000);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.use("/lobby", lobbyRouter);