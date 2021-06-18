const { Router } = require("express");
const loginController = require("./controllers/login");
const clientsController = require("./controllers/clients");
const integrationController = require("./controllers/integrations");
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

router.get("/oauth", async (req, res) => {
  const { db } = req.app.locals;
  const integration = await db("integrations")
    .where({ integration_id: req.query.client_id })
    .first();

  const redirect = new URL(integration.authorization_url);
  redirect.searchParams.append("client_id", integration.app_id);
  redirect.searchParams.append("response_type", "code");
  redirect.searchParams.append(
    "redirect_uri",
    // "https://script.google.com/macros/d/1uaDCN3bQKVJLCJAGUOmE6bof_jv8E0i_wQhrI9p0zGgH9sXSQDXOKeqy/usercallback"
    "http://localhost:3000/oauth_callback",
    // req.query.redirect_uri,
  );
  // redirect.searchParams.append('state', req.query.state);
  redirect.searchParams.append("state", "some-random-value-from-database");

  res.json({
    params: req.params,
    query: req.query,
    integration,
    redirect: {
      hash: redirect.hash,
      host: redirect.host,
      hostname: redirect.hostname,
      href: redirect.href,
      origin: redirect.origin,
      password: redirect.password,
      pathname: redirect.pathname,
      port: redirect.port,
      protocol: redirect.protocol,
      search: redirect.search,
      searchParams: Object.fromEntries([...redirect.searchParams.entries()]),
      username: redirect.username,
    },
  });
});

module.exports = router;
