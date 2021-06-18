const Joi = require("joi");

const catchError = (res, err) => {
  console.error(err);
  res.status(500).render("500.html", {
    date: new Date(),
    errorCode: 500,
    errorMessage:
      "Ocorreu um erro na aplicação, entre em contato com o administrador para mais detalhes.",
  });
};

exports.index = async (req, res) => {
  try {
    const actions = {
      "insert-success": {
        color: "green-100",
        text: "Cliente inserido com sucesso!",
      },
      "update-success": {
        color: "green-100",
        text: "Cliente atualizado com sucesso!",
      },
    };

    const clients = await req.app.locals.db("clients");
    const message = actions[req.query.action];
    res.render("clients.html", { user: res.locals.user, clients, message });
  } catch (err) {
    catchError(res, err);
  }
};

exports.create = (_req, res) => {
  res.render("clients-form.html", {
    client: {},
    user: res.locals.user,
    title_action: "Novo cliente",
    form_action: "Criar cliente",
  });
};

exports.store = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().min(4).max(50),
    });

    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
      return res.render("clients-form.html", {
        client: validationResult.value,
        user: res.locals.user,
        title_action: "Novo cliente",
        form_action: "Criar cliente",
        errors: validationResult.error.details,
      });
    }

    await req.app.locals.db("clients").insert(validationResult.value);

    res.redirect("/clients?action=insert-success");
  } catch (err) {
    catchError(res, err);
  }
};

exports.edit = async (req, res) => {
  try {
    const client = await req.app.locals
      .db("clients")
      .where("client_id", req.params.client_id)
      .first();
    const message = undefined;

    res.render("clients-form.html", {
      client,
      user: res.locals.user,
      title_action: "Editar cliente",
      form_action: "Editar cliente",
    });
  } catch (err) {
    catchError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().min(4).max(50),
    });

    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
      return res.render("clients-form.html", {
        client: {
          client_id: req.params.client_id,
          ...validationResult.value,
        },
        user: res.locals.user,
        title_action: "Editar cliente",
        form_action: "Editar cliente",
        errors: validationResult.error.details,
      });
    }

    await req.app.locals
      .db("clients")
      .where("client_id", req.params.client_id)
      .update(validationResult.value);

    res.redirect("/clients?action=update-success");
  } catch (err) {
    catchError(res, err);
  }
};
