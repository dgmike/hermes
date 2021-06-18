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

    const clients = await req.app.locals
      .db("clients")
      .orderBy("created_at", "desc");
    const message = actions[req.query.action];
    res.render("clients.html", { user: res.locals.user, clients, message });
  } catch (err) {
    catchError(res, err);
  }
};

exports.create = async (req, res) => {
  const integrations = await req.app.locals.db("integrations");

  res.render("clients-form.html", {
    client: {},
    integrations,
    emails: [],
    user: res.locals.user,
    title_action: "Novo cliente",
    form_action: "Criar cliente",
  });
};

exports.store = async (req, res) => {
  let transaction;

  try {
    const schema = Joi.object({
      name: Joi.string().required().min(4).max(50),
      email: Joi.array()
        .min(1)
        .items(Joi.string().trim().required().email())
        .required(),
      integration_id: Joi.array().items(Joi.number().required()),
    });

    const validationResult = schema.validate(req.body, {
      abortEarly: false,
      errors: {
        label: false,
      },
    });

    if (validationResult.error) {
      return res.render("clients-form.html", {
        client: validationResult.value,
        emails:
          (validationResult.value.email || []).map((email) => ({ email })) ||
          [],
        user: res.locals.user,
        title_action: "Novo cliente",
        form_action: "Criar cliente",
        errors: validationResult.error.details,
      });
    }

    const { email, integration_id, ...client } = validationResult.value;

    transaction = await req.app.locals.db.transaction();

    const [client_id] = await transaction("clients")
      .insert(client)
      .returning("client_id");

    await Promise.all(
      email.map(async (emailRow) => {
        await transaction("client_emails").insert({
          email: emailRow,
          client_id,
        });
      })
    );

    await Promise.all(
      (integration_id || []).map(async (id) => {
        await transaction("client_integrations").insert({
          client_id,
          integration_id: id,
        });
      })
    );

    await transaction.commit();

    res.redirect("/clients?action=insert-success");
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    catchError(res, err);
  }
};

exports.edit = async (req, res) => {
  try {
    const client = await req.app.locals
      .db("clients")
      .where("client_id", req.params.client_id)
      .first();

    const emails = await req.app.locals
      .db("client_emails")
      .where("client_id", req.params.client_id);

    const integrations = await req.app.locals.db("integrations");

    const clientIntegrations = await req.app.locals
      .db("client_integrations")
      .where("client_id", req.params.client_id)
      .pluck("integration_id");

    res.render("clients-form.html", {
      client,
      clientIntegrations: clientIntegrations,
      emails: emails || [],
      integrations: integrations || [],
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
      email: Joi.array()
        .min(1)
        .items(Joi.string().trim().required().email())
        .required(),
      integration_id: Joi.array().items(Joi.number().required()),
    });

    const validationResult = schema.validate(req.body, {
      abortEarly: false,
      errors: {
        label: false,
      },
    });

    if (validationResult.error) {
      const integrations = await req.app.locals.db("integrations");
      const clientIntegrations = validationResult.value.integration_id || [];

      return res.render("clients-form.html", {
        client: {
          client_id: req.params.client_id,
          ...validationResult.value,
        },
        emails:
          (validationResult.value.email || []).map((email) => ({ email })) ||
          [],
        integrations,
        clientIntegrations,
        user: res.locals.user,
        title_action: "Editar cliente",
        form_action: "Editar cliente",
        errors: validationResult.error.details,
      });
    }

    const { email, integration_id = [], ...client } = validationResult.value;

    const currentEmails = await req.app.locals
      .db("client_emails")
      .where("client_id", req.params.client_id);

    const currentIntegrations = await req.app.locals
      .db("client_integrations")
      .where("client_id", req.params.client_id);

    const mustDeleteEmails = currentEmails.filter(
      (emailRow) => !email.includes(emailRow.email)
    );

    const mustInsertEmails = email.filter(
      (emailItem) =>
        !currentEmails.map((emailRow) => emailRow.email).includes(emailItem)
    );

    const mustDeleteIntegrations = currentIntegrations.filter(
      (integration) => !integration_id.includes(integration.integration_id)
    );

    const mustInsertIntegrations = integration_id.filter(
      (integration_id_item) =>
        !currentIntegrations
          .map((integration) => integration.integration_id)
          .includes(integration_id_item)
    );

    await req.app.locals
      .db("clients")
      .where("client_id", req.params.client_id)
      .update(client);

    await Promise.all([
      ...(mustDeleteEmails.length === 0
        ? []
        : [
            req.app.locals
              .db("client_emails")
              .whereIn(
                "client_email_id",
                mustDeleteEmails.map(({ client_email_id }) => client_email_id)
              )
              .delete(),
          ]),
      ...mustInsertEmails.map((emailRow) =>
        req.app.locals
          .db("client_emails")
          .insert({ email: emailRow, client_id: req.params.client_id })
      ),
      ...(mustDeleteIntegrations.length == 0
        ? []
        : [
            req.app.locals
              .db("client_integrations")
              .whereIn(
                "client_integration_id",
                mustDeleteIntegrations.map(
                  ({ client_integration_id }) => client_integration_id
                )
              )
              .delete(),
          ]),
      ...mustInsertIntegrations.map((integration) =>
        req.app.locals.db("client_integrations").insert({
          client_id: req.params.client_id,
          integration_id: integration,
        })
      ),
    ]);

    res.redirect("/clients?action=update-success");
  } catch (err) {
    catchError(res, err);
  }
};
