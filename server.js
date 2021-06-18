const environment = require('./environment');
const createApp = require('./app');

environment.load();
const port = parseInt(process.env.PORT || '3000');

createApp()
  .then((app) =>
    app.listen(port, () => console.log(`listen on port ${port}`))
  )
  .catch((err) => {
    console.log('Erro ao levantar a aplicacao:', err)
  });
