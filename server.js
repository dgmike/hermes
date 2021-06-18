const createApp = require('./app');

const port = parseInt(process.env.PORT || '3000');

createApp()
  .then((app) => 
    app.listen(port, () => console.log(`listen on port ${port}`))
  );
