import ViteExpress from "vite-express";
import * as dotenv from "dotenv";
import express from "express";
import chalk from "chalk";

// -----------------------
// express app
// -----------------------
const app = express();
const port = 3000;
const appName = chalk.hex("#1877f2")("[triple-whale] ");
app.use(express.json());

// -----------------------
// data
// -----------------------
dotenv.config();
const { NODE_ENV } = process.env;

// -----------------------
// stream
// -----------------------
let dataSource = 0;
const updateDataSource = () => {
  const delta = Math.random();
  dataSource += delta;
};
setInterval(updateDataSource, 1000);

app.post("/stream", (req, res) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("connection", "keep-alive");
  res.setHeader("Content-Type", "text/event-stream");

  setInterval(() => {
    const data = JSON.stringify({ ticker: dataSource });
    res.write(`id: ${new Date().toLocaleTimeString()}\ndata: ${data}\n\n`);
  }, 1000);
});

// -----------------------
// loggy
// -----------------------
const loggy = () => {
  console.log(
    appName +
      chalk.green(
        `🐳🐳🐳 listening http://localhost:${
          NODE_ENV === "production" ? "80" : port
        }`
      )
  );
};

NODE_ENV === "production" ? app.use(express.static("dist")) : null;
NODE_ENV === "production"
  ? app.listen("80", loggy)
  : ViteExpress.listen(app, port, loggy);
