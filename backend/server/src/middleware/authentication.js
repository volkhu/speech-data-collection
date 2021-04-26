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
        db.getQuery("authentication/find-account"),
        { google_id: googleId }
      );

      if (!account) {
        // see if there are existing accounts already in the database since the first one should get superuser rights
        const numAccounts = await db.one(
          db.getQuery("authentication/count-accounts")
        );
        const isFirstAccount = numAccounts.count == 0;

        // create a new account since one does not exist with this Google ID
        account = await db.one(db.getQuery("authentication/create-account"), {
          google_id: googleId,
          email: email,
          has_admin_access: isFirstAccount,
          is_superuser: isFirstAccount,
        });
      }

      req.adminPanelAccount = account;
    } catch (error) {
      // admin authentication failed
      console.error(error);
    }
  }

  // also helper functions to handle privileges on routes
  req.hasAdminAccess = hasAdminAccess;
  req.isSuperuser = isSuperuser;
  next();
};

function hasAdminAccess() {
  return this.adminPanelAccount && this.adminPanelAccount.has_admin_access;
}

function isSuperuser() {
  return (
    this.adminPanelAccount &&
    this.adminPanelAccount.has_admin_access &&
    this.adminPanelAccount.is_superuser
  );
}

// device ID authentication strategy for mobile app clients
const mobileAppAuthentication = async (req, res, next) => {
  const deviceId = req.headers["x-deviceid"];

  if (deviceId && deviceId.length) {
    try {
      const profile = await db.one(db.getQuery("authentication/find-profile"), {
        device_id: deviceId,
      });

      req.mobileAppProfile = profile;
    } catch (error) {
      // mobile app authentication failed
    }
  }

  next();
};

module.exports = { adminPanelAuthentication, mobileAppAuthentication };
