const app = require('./app');
const { env } = require('./config/env');

app.listen(env.port, () => {
  console.log(`[aulabase-sql-api] escuchando en http://localhost:${env.port}`);
});
