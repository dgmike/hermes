const bcrypt = require("bcrypt");
const axios = require("axios");

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
  redirect.searchParams.append("state", token);

  res.redirect(redirect);
};

exports.oauth2 = async ({ params, query, res, app: { locals: { db } } }) => {
  const session = await db("sessions")
    .where({ token: query.state })
    .first();

  const redirect_uri = new URL(session.redirect_uri);
  redirect_uri.searchParams.append('code', query.code);
  redirect_uri.searchParams.append('state', session.state);

  // check token
  const tokenURL = "https://api.mercadolibre.com/oauth/token";

  const tokenData = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "8587496222794491",
    client_secret: "zieemA963GuqC18LPsCp6xjEqpnMDCbd",
    code: query.code,
    redirect_uri: "https://hermes-store.herokuapp.com/oauth2",
  });

  try {
    const tokenResponse = await axios.post(tokenURL, tokenData.toString());

    const userData = await axios.get('https://api.mercadolibre.com/users/me', {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
      },
    });

    // fazer request para /me
    // validar e-mail nos e-mails habilitados para essa integration

    console.log('userData', userData.data);

    await db('sessions')
      .where({ session_id: session.session_id })
      .update({
        integration_token: tokenResponse.data,
      });

    // res.json({ ok: 200, response: tokenResponse.data });
  } catch (err) {
    console.error("ERRO", err);
    // res.json({ ok: false });
  }

  res.json({
    params,
    query,
    session,
    redirect_uri,
  });
};

exports.token = async ({ res, query, body, params }) => {
  console.log('body', body);
  console.log('query', query);
  console.log('params', params);

  res.json({ ok: 200 });
};
