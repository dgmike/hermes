const bcrypt = require("bcrypt");
const axios = require("axios");

const createToken = () =>
  Buffer.from(bcrypt.hashSync(bcrypt.genSaltSync(), 10)).toString('base64');

exports.oauth = async (req, res) => {
  const { db } = req.app.locals;
  const integration = await db("integrations")
    .where({ integration_id: `${req.query.client_id}` })
    .first();

  const token = createToken();

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

    console.log('userData', userData.data.email);

    const [{ count: results }] = await db('client_integrations')
      .count()
      .join('client_emails', 'client_integrations.client_id', 'client_emails.client_id')
      .where({
        'client_integrations.integration_id': session.integration_id,
        'client_emails.email': userData.data.email,
      });

    console.log('results', typeof parseInt(results), parseInt(results))

    if (parseInt(results) <= 0) {
      res.json({ ok: false });
      return;
    }

    await db('sessions')
      .where({ session_id: session.session_id })
      .update({
        validation_token: createToken(),
        integration_token: tokenResponse.data,
      });

    res.redirect(redirect_uri);
  } catch (err) {
    console.error("ERRO", err);
    res.json({ ok: false });
  }
};

exports.token = async ({ res, query, body, params, app: { locals: { db } } }) => {
  const session = await db('sessions')
    .where({ validation_token: body.code })
    .first();

  res.status(400).json(session.integration_token);
};
