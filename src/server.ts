import "./configurations/environments";

import { createApp } from "./app";

const port = process.env["PORT"] || 3000;

createApp().then((app) =>
  app.listen(port, () => console.log(`Listen on port ${port}`))
);
