const createApp = require('./app');

const port = parseInt(process.env.PORT || '3000');

createApp()
  .then((app) =>
    app.listen(port, () => console.log(`listen on port ${port}`))
  )
  .catch((err) => {
    console.log('Erro ao levantar a aplicacao:', err)
  });
