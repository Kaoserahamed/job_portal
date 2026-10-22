const UserModel = require("./model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../shared/jwt.service");
const {
  generateSecret,
  verifyToken,
  generateProvisioningUrl,
} = require("../../shared/mfa.service");

function userView(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    location: user.location,
    isActive: user.is_active,
    emailVerified: user.email_verified,
    mfaEnabled: !!user.mfa_enabled,
  };
}

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, role, firstName, lastName, phone, location } =
        req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const user = await UserModel.create({
        email,
        password,
        role: role || "candidate",
        firstName,
        lastName,
        phone,
        location,
      });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return res.status(201).json({
        message: "User registered successfully",
        user: userView(user),
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password, mfaToken } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await UserModel.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.mfa_enabled) {
        if (!mfaToken || !verifyToken(mfaToken, user.mfa_secret)) {
          return res.status(401).json({
            error: "MFA token required",
            mfaRequired: true,
          });
        }
      }

      const accessToken = generateAccessToken({
        ...user,
        mfaVerified: true,
      });
      const refreshToken = generateRefreshToken(user);

      return res.json({
        message: "Login successful",
        user: userView(user),
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
      }

      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(
        refreshToken,
        require("../../shared/jwt.service").verifyRefreshToken
          ? require("../../config").jwt.refreshSecret
          : "",
      );

      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }

      const accessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      return res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      return res
        .status(403)
        .json({ error: "Invalid or expired refresh token" });
    }
  }

  static async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ user: userView(user) });
    } catch (error) {
      console.error("Get me error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async mfaSetup(req, res) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const secret = generateSecret();
      const provisioningUrl = await generateProvisioningUrl(secret);

      return res.json({
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        qrCode: provisioningUrl,
      });
    } catch (error) {
      console.error("MFA setup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async mfaVerify(req, res) {
    try {
      const { token, secret } = req.body;
      if (!token || !secret) {
        return res.status(400).json({ error: "Token and secret are required" });
      }

      const valid = verifyToken(token, secret);
      if (!valid) {
        return res.status(401).json({ error: "Invalid MFA token" });
      }

      await UserModel.updateMfa(req.user.userId, { secret, enabled: true });

      return res.json({ message: "MFA enabled successfully" });
    } catch (error) {
      console.error("MFA verify error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async mfaDisable(req, res) {
    try {
      await UserModel.updateMfa(req.user.userId, {
        secret: null,
        enabled: false,
      });
      return res.json({ message: "MFA disabled successfully" });
    } catch (error) {
      console.error("MFA disable error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async oauth2Authorize(req, res) {
    const { provider } = req.params;
    const config = require("../../config");
    let clientId;
    let redirectUri;
    let scope;

    if (provider === "google") {
      clientId = config.google.clientId;
      redirectUri = `${req.protocol}://${req.get("host")}/api/v1/auth/oauth2/google/callback`;
      scope = "openid email profile";
    } else if (provider === "github") {
      clientId = config.github.clientId;
      redirectUri = `${req.protocol}://${req.get("host")}/api/v1/auth/oauth2/github/callback`;
      scope = "user:email";
    } else {
      return res.status(400).json({ error: "Unsupported provider" });
    }

    if (!clientId) {
      return res.status(400).json({ error: "Provider not configured" });
    }

    const state = require("uuid").v4();
    res.cookie("oauth_state", state, { httpOnly: true, secure: req.secure });

    const authUrl = new URL(
      provider === "google"
        ? "https://accounts.google.com/o/oauth2/v2/auth"
        : "https://github.com/login/oauth/authorize",
    );
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    return res.redirect(authUrl.toString());
  }

  static async oauth2Callback(req, res) {
    return res.json({
      message:
        "OAuth2 callback handler - implement token exchange and user linking",
      provider: req.params.provider,
    });
  }
}

module.exports = AuthController;
