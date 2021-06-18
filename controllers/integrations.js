const { Router } = require("express");
const loginController = require("./login");
const Joi = require("joi");

const router = Router();

router.all("/*", loginController.secureRoute);

router.get("/", async (req, res) => {
  const actions = {
    "insert-success": {
      color: "green-100",
      text: "Recurso inserido com sucesso!",
    },
    "update-success": {
      color: "green-100",
      text: "Recurso atualizado com sucesso!",
    },
    removed: {
      color: "green-100",
      text: "Recurso removido com sucesso!",
    }
  };

  const message = actions[req.query.action];

  const resources = await req.app.locals
    .db("integrations")
    .orderBy("created_at", "desc");

  res.render("integrations.html", {
    message,
    user: res.locals.user,
    resources,
    title: "Integrações",
    baseUrl: "/integrations",
    resourceIdColumn: "integration_id",
    columns: {
      integration_id: ["ID"],
      name: ["Nome", "mdl-data-table__cell--non-numeric"],
      app_id: ["App ID", "mdl-data-table__cell--non-numeric"],
      created_at: ["Criado em"],
      updated_at: ["Atualizado em"],
    },
  });
});

router.get("/new", loginController.secureRoute, async (_req, res) => {
  res.render("integrations-form.html", {
    user: res.locals.user,
    title: "Criar recurso de integrações",
    baseUrl: "/integrations",
    formAction: "/integrations",
    fields: [
      {
        type: "text",
        name: "name",
        label: "Nome",
      },
      {
        type: "text",
        name: "app_id",
        label: "Chave de APP",
      },
      {
        type: "text",
        name: "secret_key",
        label: "Chave segura de API",
      },
    ],
  });
});

router.post("/", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().max(100),
    app_id: Joi.string().trim().max(255),
    secret_key: Joi.string().trim().max(255),
  });
  const validation = schema.validate(req.body, {
    abortEarly: false,
    errors: {
      label: false,
    },
  });
  if (validation.error) {
    return res.render("integrations-form.html", {
      user: res.locals.user,
      title: "Integrações",
      baseUrl: "/integrations",
      formAction: "/integrations",
      fields: [
        {
          type: "text",
          name: "name",
          label: "Nome",
          value: validation.value.name,
          errors: validation.error.details.filter((error) =>
            error.path.includes("name")
          ),
        },
        {
          type: "text",
          name: "app_id",
          label: "Chave de APP",
          value: validation.value.app_id,
          errors: validation.error.details.filter((error) =>
            error.path.includes("app_id")
          ),
        },
        {
          type: "text",
          name: "secret_key",
          label: "Chave segura de API",
          value: validation.value.secret_key,
          errors: validation.error.details.filter((error) =>
            error.path.includes("secret_key")
          ),
        },
      ],
    });
  }

  await req.app.locals.db("integrations").insert(validation.value);

  res.redirect("/integrations/?action=insert-success");
});

router.param("integration_id", async (req, res, next, param) => {
  const resource = await res.app.locals
    .db("integrations")
    .where("integration_id", param)
    .first();
  if (!resource) {
    return res.status(404).render("error.html", {
      errorCode: 404,
      errorMessage: "Recurso não encontrado",
      date: new Date(),
    });
  }
  req.params.resource = resource;
  next();
});

router.get("/:integration_id/edit", async (req, res) => {
  const resource = req.params.resource;

  res.render("integrations-form.html", {
    user: res.locals.user,
    title: `Editar recurso de integrações # ${resource.integration_id}`,
    formAction: `/integrations/${resource.integration_id}`,
    fields: [
      {
        type: "text",
        name: "name",
        label: "Nome",
        value: resource.name,
      },
      {
        type: "text",
        name: "app_id",
        label: "Chave de APP",
        value: resource.app_id,
      },
      {
        type: "text",
        name: "secret_key",
        label: "Chave segura de API",
        value: resource.secret_key,
      },
    ],
  });
});

router.post("/:integration_id", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().max(100),
    app_id: Joi.string().trim().max(255),
    secret_key: Joi.string().trim().max(255),
  });

  const validation = schema.validate(req.body, {
    abortEarly: false,
    errors: {
      label: false,
    },
  });

  if (validation.error) {
    return res.render("integrations-form.html", {
      user: res.locals.user,
      title: `Editar recurso de integrações # ${req.params.integration_id}`,
      formAction: `/integrations/${req.params.integration_id}`,
      fields: [
        {
          type: "text",
          name: "name",
          label: "Nome",
          value: validation.value.name,
          errors: validation.error.details.filter((error) =>
            error.path.includes("name")
          ),
        },
        {
          type: "text",
          name: "app_id",
          label: "Chave de APP",
          value: validation.value.app_id,
          errors: validation.error.details.filter((error) =>
            error.path.includes("app_id")
          ),
        },
        {
          type: "text",
          name: "secret_key",
          label: "Chave segura de API",
          value: validation.value.secret_key,
          errors: validation.error.details.filter((error) =>
            error.path.includes("secret_key")
          ),
        },
      ],
    });
  }

  await req.app.locals
    .db("integrations")
    .where("integration_id", req.params.integration_id)
    .update(validation.value);

  res.redirect("/integrations/?action=update-success");
});

router.post("/:integration_id/remove", async (req, res) => {
  const { db } = req.app.locals;
  const { integration_id } = req.params;
  await db("client_integrations")
    .where("integration_id", integration_id)
    .delete()
    .debug();
  await db("integrations")
    .where("integration_id", integration_id)
    .delete()
    .debug();
  res.redirect("/integrations?action=removed");
});

module.exports = router;
