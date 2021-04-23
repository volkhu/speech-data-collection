const db = require("../db/db");
const { OAuth2Client } = require("google-auth-library");

// google ID token authentication strategy for admin panel accounts
const gAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const adminPanelAuthentication = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.length) {
    try {
      // verify client's Google account using the ID token in HTTP Authorization header
      const loginTicket = await gAuthClient.verifyIdToken({
        idToken: req.headers.authorization,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const parsedToken = loginTicket.getPayload();
      const googleId = parsedToken.sub;
      const email = parsedToken.email;

      // get account from database with this Google ID
      let account = await db.oneOrNone(
        "SELECT account_id, google_id, email, has_admin_access, is_superuser \
        FROM account \
        WHERE google_id = $1",
        [googleId]
      );

      if (!account) {
        // see if there are existing accounts already in the database since the first one should get superuser rights
        const numAccounts = await db.one(
          "SELECT COUNT(*) AS count \
          FROM account"
        );
        const isFirstAccount = numAccounts.count == 0;

        // create a new account since one does not exist with this Google ID
        account = await db.one(
          "INSERT INTO account (google_id, email, has_admin_access, is_superuser) \
          VALUES ($1, $2, $3, $4) \
          RETURNING account_id, google_id, email, has_admin_access, is_superuser",
          [googleId, email, isFirstAccount, isFirstAccount]
        );
      }

      req.adminPanelAccount = account;
    } catch (error) {
      // admin authentication failed
    }
  }

  next();
};

// device ID authentication strategy for mobile app clients
const mobileAppAuthentication = async (req, res, next) => {
  const deviceId = req.headers["x-deviceid"];

  if (deviceId && deviceId.length) {
    try {
      const profile = await db.one(
        "SELECT device_id, profile_id, created_at, year_of_birth, gender, native_language, dialect \
        FROM profile \
        WHERE device_id = $1",
        [deviceId]
      );

      req.mobileAppProfile = profile;
    } catch (error) {
      // mobile app authentication failed
    }
  }

  next();
};

module.exports = { adminPanelAuthentication, mobileAppAuthentication };
