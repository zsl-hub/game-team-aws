const dotenv = require('dotenv').config();
const express = require("express");
const Alby = require("ably");
const p2 = require("p2");

const app = express();

console.log("hello world!");