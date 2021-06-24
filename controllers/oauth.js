exports.oauth = async (req, res) => {
  const { db } = req.app.locals;
  const integration = await db("integrations")
    .where({ client_id: `${req.query.client_id}` })
    .first();

  const redirect = new URL(integration.authorization_url);
  redirect.searchParams.append("integration_id", integration.app_id);
  redirect.searchParams.append("response_type", "code");
  redirect.searchParams.append(
    "redirect_uri",
    // "https://script.google.com/macros/d/1uaDCN3bQKVJLCJAGUOmE6bof_jv8E0i_wQhrI9p0zGgH9sXSQDXOKeqy/usercallback"
    // "http://localhost:3000/oauth_callback",
    // req.query.redirect_uri,
    'https://hermes-store.herokuapp.com/oauth2'
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
};

exports.oauth2 = async (req, res) => {
  res.json({
    params: req.params,
    query: req.query,
  });
};
