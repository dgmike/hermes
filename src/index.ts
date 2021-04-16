import express from 'express';

const app = express();

app.get('/', (_req, res) => res.json({ result: 'OK' }));

app.listen(process.env['PORT'] || 3000, () => console.log('Listen on port 3000'));
