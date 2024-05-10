const dotenv = require('dotenv').config();
const express = require("express");
const Alby = require("ably");
const p2 = require("p2");
const path = require("path");
const cors = require("cors");

const app = express();

app.listen(3000);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(cors());
  
// tu pozniej to przeslac do bazy danych
app.post("/api/lobby", (req,res) => {
    console.log(req.body.lobbyName);
    console.log(req.body.isPrivate);
    console.log(req.body.lobbyPass);
}); 

/*
// to musze zmienic aby ten startpage sie odpalal pierwszy
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../.././frontend/views/lobby/lobby.html'));
}); */