require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(helmet());

app.get("/", (req, res, next) => {
	res.send("Hello");
});

module.exports = app;
