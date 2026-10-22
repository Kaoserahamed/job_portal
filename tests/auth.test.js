process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
  pool: { end: jest.fn() },
}));
jest.mock("../src/shared/mfa.service", () => ({
  generateSecret: jest.fn(() => ({
    base32: "JBSWY3DPEHPK3PXP",
    otpauth_url: "otpauth://totp/JobPortal:test@test.com?issuer=JobPortal",
  })),
  verifyToken: jest.fn(() => true),
  generateProvisioningUrl: jest.fn(() => "data:image/png;base64,abc"),
  verifyRecoveryCode: jest.fn(() => true),
}));

const { query } = require("../src/config/database");
const {
  verifyToken,
  generateSecret,
  generateProvisioningUrl,
} = require("../src/shared/mfa.service");
const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const config = require("../src/config");

const PASSWORD = "password123";
const hashedPassword = bcrypt.hashSync(PASSWORD, 12);

function makeUserRow(overrides = {}) {
  return {
    id: overrides.id || 1,
    email: overrides.email || "candidate@test.com",
    password: hashedPassword,
    role: overrides.role || "candidate",
    first_name: overrides.first_name || "John",
    last_name: overrides.last_name || "Doe",
    phone: null,
    location: null,
    is_active: true,
    email_verified: false,
    mfa_secret: overrides.mfa_secret || null,
    mfa_enabled: overrides.mfa_enabled || false,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

const candidateRow = makeUserRow();
const employerRow = makeUserRow({
  id: 2,
  email: "employer@test.com",
  role: "employer",
  first_name: "Jane",
  last_name: "Smith",
});
const mfaUserRow = makeUserRow({
  id: 3,
  email: "mfa@test.com",
  mfa_enabled: true,
  mfa_secret: "JBSWY3DPEHPK3PXP",
});

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: "15m" },
  );
}

beforeEach(() => {
  query.mockReset();
  verifyToken.mockReset();
  verifyToken.mockReturnValue(true);
});

describe("Authentication", () => {
  it("should register a new candidate", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [candidateRow] });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "candidate@test.com",
      password: PASSWORD,
      role: "candidate",
      firstName: "John",
      lastName: "Doe",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("candidate@test.com");
    expect(res.body.user.role).toBe("candidate");
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("should not register duplicate email", async () => {
    query.mockResolvedValueOnce({ rows: [candidateRow] });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "candidate@test.com",
      password: PASSWORD,
      role: "candidate",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  it("should login successfully", async () => {
    query.mockResolvedValueOnce({ rows: [candidateRow] });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "candidate@test.com", password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.mfaRequired).toBeUndefined();
  });

  it("should reject invalid credentials", async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "candidate@test.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("should require MFA token when MFA is enabled", async () => {
    query.mockResolvedValueOnce({ rows: [mfaUserRow] });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "mfa@test.com", password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.mfaRequired).toBe(true);
  });

  it("should login with valid MFA token", async () => {
    query.mockResolvedValueOnce({ rows: [mfaUserRow] });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "mfa@test.com", password: PASSWORD, mfaToken: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(verifyToken).toHaveBeenCalledWith("123456", "JBSWY3DPEHPK3PXP");
  });

  it("should reject invalid MFA token", async () => {
    verifyToken.mockReturnValueOnce(false);
    query.mockResolvedValueOnce({ rows: [mfaUserRow] });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "mfa@test.com", password: PASSWORD, mfaToken: "000000" });

    expect(res.status).toBe(401);
  });
});

describe("Role-based access control", () => {
  const candidateToken = signAccessToken(candidateRow);
  const employerToken = signAccessToken(employerRow);

  it("should allow employer to create a job", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 10,
          employer_id: 2,
          title: "Engineer",
          status: "active",
          created_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Engineer",
        description: "Build things",
        location: "NYC",
        employmentType: "full-time",
      });

    expect(res.status).toBe(201);
    expect(res.body.job.title).toBe("Engineer");
  });

  it("should forbid candidate from creating a job", async () => {
    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        title: "Engineer",
        description: "Build things",
        location: "NYC",
        employmentType: "full-time",
      });

    expect(res.status).toBe(403);
  });

  it("should allow unauthenticated access to job list", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: "1" }] });
    query.mockResolvedValueOnce({
      rows: [
        { id: 1, title: "Engineer", employer_id: 2, created_at: new Date() },
      ],
    });

    const res = await request(app).get("/api/v1/jobs");
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
  });

  it("should require authentication for /auth/me", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("should return current user for /auth/me", async () => {
    query.mockResolvedValueOnce({ rows: [candidateRow] });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("candidate@test.com");
  });
});

describe("MFA", () => {
  const candidateToken = signAccessToken(candidateRow);

  it("should setup MFA", async () => {
    query.mockResolvedValueOnce({ rows: [candidateRow] });
    query.mockResolvedValueOnce({ rows: [candidateRow] });

    const res = await request(app)
      .post("/api/v1/auth/mfa/setup")
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.secret).toBe("JBSWY3DPEHPK3PXP");
    expect(res.body.otpauthUrl).toBeDefined();
    expect(res.body.qrCode).toBeDefined();
    expect(generateSecret).toHaveBeenCalled();
    expect(generateProvisioningUrl).toHaveBeenCalled();
  });

  it("should verify and enable MFA", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, mfa_enabled: true }] });

    const res = await request(app)
      .post("/api/v1/auth/mfa/verify")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({ token: "123456", secret: "JBSWY3DPEHPK3PXP" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("MFA enabled successfully");
  });
});
