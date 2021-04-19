import "./configurations/environments";

import { createApp } from "./app";

const hostname = process.env["SERVER_HOSTNAME"] || "0.0.0.0";
const port = parseInt(process.env["PORT"] || "3000");
const isDefaultPort = [80, 443].includes(port);
const portDisplay = isDefaultPort ? "" : `:${port}`;
const schema = port === 443 ? "https" : "http";

createApp().then((app) =>
  app.listen(port, hostname, (): void | undefined => {
    console.log(`Listen on port ${schema}://${hostname}${portDisplay}`);
  })
);
