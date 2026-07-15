import express from 'express';
import os from 'os';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Change this message during the live demo (e.g. "v2 - now live!")
// to prove a fresh commit really flows all the way to the running pod.
const MESSAGE = 'Hello from the Simple CI/CD Demo!';

app.get('/', (req, res) => {
  res.json({
    message: MESSAGE,
    version: process.env.APP_VERSION || '1.0.0',
    hostname: os.hostname() // useful to show load across replicas
  });
});

app.get('/health', (req, res) => {
  console.log('done');
  res.json({ status: 'UP', message: "hi kunal" });
});

// ESM equivalent of `if (require.main === module)` — only start the
// server when this file is run directly, not when Jest imports it.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
