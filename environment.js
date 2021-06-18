const dotenvFlow = require('dotenv-flow');
const dotenvSafe = require('dotenv-safe');

const load = () => {
  const dotenvFlowFiles = dotenvFlow.listDotenvFiles(__dirname);
  console.log('dotenv flow files', dotenvFlowFiles.map((file) => `\n  > ${file.replace(__dirname, '.')}`).join(''));
  dotenvFlow.config();

  dotenvSafe.config();
}

module.exports = { load };
