const { Router } = require("express");
const loginController = require("./controllers/login");
const clientsController = require("./controllers/clients");
const integrationController = require("./controllers/integrations");
const oauthController = require("./controllers/oauth");
const createCrud = require("./utils/crud");
const Joi = require("joi");
const { passwordCrypt } = require("./utils/crypt");

const router = Router();

router.get("/", loginController.home);
router.post("/login", loginController.login);
router.get("/logout", loginController.logout);
router.get(
  "/dashboard",
  loginController.secureRoute,
  loginController.dashboard
);

// clients
router.all("/clients*", loginController.secureRoute);
router.get("/clients", clientsController.index);
router.get("/clients/new", clientsController.create);
router.post("/clients", clientsController.store);
router.get("/clients/:client_id/edit", clientsController.edit);
router.post("/clients/:client_id", clientsController.update);
router.post("/clients/:client_id/remove", clientsController.delete);

router.use("/integrations", integrationController);

router.use(
  "/users",
  createCrud({
    resourceTable: "users",
    resourceIdColumn: "user_id",
    resourceName: {
      singular: "usuário",
      plural: "usuários",
    },
    baseUrl: "/users",
    listColumns: {
      name: "Nome",
      username: "Usuário",
    },
    formFields: [
      {
        type: "text",
        name: "name",
        label: "Nome",
      },
      {
        type: "text",
        name: "username",
        label: "Usuário",
      },
      {
        type: "password",
        name: "password",
        label: "Senha",
        hiddenValue: true,
      },
    ],
    schema: Joi.object({
      name: Joi.string().trim().required().max(100),
      username: Joi.string().trim().alphanum().min(4).max(100),
      password: Joi.string()
        .empty("")
        .trim()
        .min(5)
        .max(100)
        .custom((value) => passwordCrypt(value)),
    }),
    async removeAction(user_id, db) {
      await db("users").where({ user_id }).delete();
    },
  })
);

router.get("/oauth", oauthController.oauth);
router.get("/oauth2", oauthController.oauth2);
router.post("/token", oauthController.token);

router.post("/callback", (req, res) => {
  console.info('/callback', { body: req.body, params: req.params, query: req.query });
  res.status(404).json({ error: true, message: 'resource not found' });
});

router.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

module.exports = router;
