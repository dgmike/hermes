const bcrypt = require("bcrypt");

exports.passwordCrypt = (value) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(value, salt);
};
