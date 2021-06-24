const bcrypt = require("bcrypt");

exports.oauth = async (req, res) => {
  const { db } = req.app.locals;
  const integration = await db("integrations")
    .where({ integration_id: `${req.query.client_id}` })
    .first();

  const token = Buffer.from(bcrypt.hashSync(bcrypt.genSaltSync(), 10)).toString('base64');

  await db("sessions")
    .insert({
      token,
      integration_id: integration.integration_id,
      state: req.query.state,
      redirect_uri: req.query.redirect_uri,
    });

  const redirect = new URL(integration.authorization_url);
  redirect.searchParams.append("client_id", integration.app_id);
  redirect.searchParams.append("response_type", "code");
  redirect.searchParams.append(
    "redirect_uri",
    "https://hermes-store.herokuapp.com/oauth2",
  );
  // redirect.searchParams.append('state', req.query.state);
  redirect.searchParams.append("state", token);

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
};

exports.oauth2 = async ({ params, query, res, app: { locals: { db } } }) => {
  const session = await db("sessions")
    .where({ state: query.state })
    .debug()
    .first();

  res.json({
    params,
    query,
    session,
  });
};
