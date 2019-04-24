const axios = require("axios");
const bodyParser = require("body-parser");
const express = require("express");
const redis = require("redis");
const util = require("util");

const {
  NODE_PORT: nodePort = 3000,
  REDIS_HOST: redisHost = "redis",
  REDIS_PORT: redisPort = 6379,
  REDIS_EX: redisExpire = 60 * 60 * 4
} = process.env;

const app = express();
app.use(bodyParser.json());

const client = redis.createClient(`redis://${redisHost}:${redisPort}`);
client.hget = util.promisify(client.hget);

app.get("/", async (req, res) => {
  res.send({ success: true, bodyParser: true });
});

app.get("/item", async (req, res) => {
  const { hash = "", key = "" } = req.query;
  const value = await client.hget(hash, key);
  console.log(`GET: ${hash} ${key} ${value}`);
  res.send({ success: true, hash, key, value });
});

app.post("/item", async (req, res) => {
  const { hash = "", key = "", value = "" } = req.body;
  console.log(`POST: ${hash} ${key} ${value}`);
  client.hset(hash, key, value, "EX", redisExpire);
  res.send({ success: true, hash, key, value });
});

app.listen(nodePort, err => {
  console.log(`Listening on port ${nodePort}.`);
});
