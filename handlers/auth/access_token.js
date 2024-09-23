const openidIssuer = require('./openidIssuer');
const conf = require('../../conf/config');

module.exports = async function access_token(req, res) {
  try {
    const client = await openidIssuer.getOpenidClient();
    const code = req.body.code;
    const refresh_token = req.body.refresh_token;
    let token_set = null;
    if (code && code.length && refresh_token && refresh_token.length) {
      res.status(400).send('Bad Request: Send either code or refresh token. Not both.');
    } else if (code && code.length) {
      token_set = await client.grant({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: conf.auth.redirect_uri
      });
      
      if (conf.auth.setAccessTokenCookie) {
        res.cookie('OIDC_ACCESS_TOKEN', token_set.access_token, {
          domain: conf.auth.accessTokenCookieDomain,
          expires: new Date(token_set.expires_at * 1000),
          httpOnly: true,
          path: '/',
          secure: true,
          sameSite: 'Strict'
        });
        res.cookie('OIDC_ACCESS_TOKEN_EXPIRES', token_set.expires_at, {
          domain: conf.auth.accessTokenCookieDomain,
          expires: new Date(token_set.expires_at * 1000),
          httpOnly: true,
          path: '/',
          secure: true,
          sameSite: 'Strict'
        });
      }
    } else if (refresh_token && refresh_token.length) {
      token_set = await client.grant({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      });
    } else {
      res.status(400).send('Bad Request: Neither code nor refresh token found.');
    }
    const user_info = await client.userinfo(token_set.access_token);
    res.json({
      authenticated: true,
      access_token: token_set.access_token,
      refresh_token: token_set.refresh_token,
      id_token: token_set.id_token,
      expires_at: token_set.expires_at,
      displayname: user_info[conf.auth.display_name]
    });
  } catch (e) {
    console.error(e.toString());
    res.status(500).send('access_token error');
  }
};
