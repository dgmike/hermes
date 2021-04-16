import express from "express";

const app = express();

app.get("/", (_req, res) => res.json({ result: "OK" }));

const port = process.env["PORT"] || 3000;

app.listen(port, () => console.log(`Listen on port ${port}`));
