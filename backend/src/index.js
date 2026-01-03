import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/health", async (req, res) => {
  const result = await pool.query("SELECT 1");
  res.json({ status: "ok", db: result.rowCount });
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
