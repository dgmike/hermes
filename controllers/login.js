const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const JWT_SECRET = process.env["JWT_SECRET"] || "123pim";
const logout = (res) => res.clearCookie("access_token").redirect(302, "/");

exports.secureRoute = (req, res, next) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    return logout(res);
  }
  const accessToken = access_token.replace(/^Bearer /, "");
  jwt.verify(accessToken, JWT_SECRET, (err, payload) => {
    if (err) {
      return logout(res);
    }
    res.locals.user = payload;
    next();
  });
};

exports.home = async (_req, res) => {
  res.render("home.html");
};

exports.login = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error, value: body } = schema.validate(req.body);

  if (error) {
    return res.status(422).render("home.html", { message: "Login inválido" });
  }

  const user = await req.app.locals
    .db("users")
    .where("username", body.username)
    .first();

  if (!user || !bcrypt.compareSync(body.password, user.password)) {
    return res.status(422).render("home.html", { message: "Login inválido" });
  }

  const data = {
    name: user.name,
    username: user.username,
  };
  const token = jwt.sign(data, JWT_SECRET, { expiresIn: "2h" });

  return res
    .cookie("access_token", `Bearer ${token}`, {
      expires: new Date(Date.now() + 2 * 3600000),
    })
    .redirect(302, "/dashboard");
};

exports.logout = (_req, res) => {
  return logout(res);
};

exports.dashboard = (req, res) => {
  res.render("dashboard.html", { user: res.locals.user });
};
