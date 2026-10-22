const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const config = require("../config");

function generateSecret() {
  return speakeasy.generateSecret({
    name: config.mfa.issuer,
    issuer: config.mfa.issuer,
  });
}

function verifyToken(token, secret) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

async function generateProvisioningUrl(secret) {
  return QRCode.toDataURL(secret.otpauth_url);
}

function verifyRecoveryCode(code, storedHash) {
  return code === storedHash;
}

module.exports = {
  generateSecret,
  verifyToken,
  generateProvisioningUrl,
  verifyRecoveryCode,
};
