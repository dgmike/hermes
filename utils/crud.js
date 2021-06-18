const { Router } = require("express");
const loginController = require("../controllers/login");

const createCrud = (options) => {
  const index = async (req, res) => {
    const actions = {
      "insert-success": {
        color: "green-100",
        text: "Recurso inserido com sucesso!",
      },
      "update-success": {
        color: "green-100",
        text: "Recurso atualizado com sucesso!",
      },
    };

    const message = actions[req.query.action];

    const resources = await req.app.locals
      .db(options.resourceTable)
      .orderBy("created_at", "desc");

    const title = [
      options.resourceName.plural[0].toUpperCase(),
      options.resourceName.plural.slice(1),
    ].join("");

    res.render("resources.html", {
      message,
      user: res.locals.user,
      resources,
      title,
      baseUrl: options.baseUrl,
      resourceIdColumn: options.resourceIdColumn,
      columns: {
        [options.resourceIdColumn]: "ID",
        ...(options.listColumns || {}),
        created_at: "Criado em",
        updated_at: "Atualizado em",
      },
    });
  };

  const create = async (_req, res) => {
    res.render("integrations-form.html", {
      user: res.locals.user,
      title: `Criar recurso de ${options.resourceName.plural}`,
      formAction: options.baseUrl,
      fields: options.formFields,
    });
  };

  const store = async (req, res) => {
    const validation = options.schema.validate(req.body, {
      abortEarly: false,
      errors: {
        label: false,
      },
    });

    if (validation.error) {
      return res.render("resources-form.html", {
        user: res.locals.user,
        title: `Criar recurso de ${options.resourceName.plural}`,
        formAction: options.baseUrl,
        fields: options.formFields.map((item) => ({
          ...item,
          value: item.hiddenValue ? "" : validation.value[item.name],
          errors: validation.error.details.filter((error) =>
            error.path.includes(item.name)
          ),
        })),
      });
    }

    await req.app.locals.db(options.resourceTable).insert(validation.value);

    res.redirect(`${options.baseUrl}/?action=insert-success`);
  };

  const edit = async (req, res) => {
    const { resource } = req.params;

    res.render("resources-form.html", {
      user: res.locals.user,
      title: `Editar ${options.resourceName.singular} # ${
        resource[options.resourceIdColumn]
      }`,
      formAction: `${options.baseUrl}/${resource[options.resourceIdColumn]}`,
      fields: options.formFields.map((item) => ({
        ...item,
        value: item.hiddenValue ? "" : resource[item.name],
      })),
    });
  };

  const update = async (req, res) => {
    const { resource } = req.params;

    const validation = options.schema.validate(req.body, {
      abortEarly: false,
      errors: {
        label: false,
      },
    });

    if (validation.error) {
      return res.render("resources-form.html", {
        user: res.locals.user,
        title: `Editar ${options.resourceName.singular} # ${
          resource[options.resourceIdColumn]
        }`,
        formAction: `${options.baseUrl}/${req.params[options.resourceIdColumn]}`,
        fields: options.formFields.map((item) => ({
          ...item,
          value: item.hiddenValue ? "" : validation.value[item.name],
          errors: validation.error.details.filter((error) =>
            error.path.includes(item.name)
          ),
        })),
      });
    }

    await req.app.locals
      .db(options.resourceTable)
      .where(options.resourceIdColumn, req.params[options.resourceIdColumn])
      .update(validation.value);

    res.redirect(`${options.baseUrl}/?action=update-success`);
  };

  const resourceParamFetcher = async (req, res, next, param) => {
    const resource = await res.app.locals
      .db(options.resourceTable)
      .where(options.resourceIdColumn, param)
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
  };

  const router = Router();
  router.param(options.resourceIdColumn, resourceParamFetcher);
  router.all("/*", loginController.secureRoute);
  router.get("/", index);
  router.post("/", store);
  router.get("/new", create);
  router.get(`/:${options.resourceIdColumn}/edit`, edit);
  router.post(`/:${options.resourceIdColumn}`, update);

  return router;
};

module.exports = createCrud;
