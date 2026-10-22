jest.mock("../src/config/database", () => ({
  query: jest.fn(),
  pool: { end: jest.fn() },
}));

process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";

const { query } = require("../src/config/database");
const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

const PASSWORD = "password123";
let hashedPassword;

beforeAll(async () => {
  hashedPassword = await bcrypt.hash(PASSWORD, 12);
});

const employerRow = {
  id: 2,
  email: "employer@test.com",
  password: hashedPassword,
  role: "employer",
  first_name: "Jane",
  last_name: "Smith",
  is_active: true,
  email_verified: false,
};

const candidateRow = {
  id: 1,
  email: "candidate@test.com",
  password: hashedPassword,
  role: "candidate",
  first_name: "John",
  last_name: "Doe",
  is_active: true,
  email_verified: false,
};

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    require("../src/config").jwt.secret,
    { expiresIn: "15m" },
  );
}

beforeEach(() => {
  query.mockReset();
});

describe("Jobs API", () => {
  const employerToken = signAccessToken(employerRow);
  const candidateToken = signAccessToken(candidateRow);

  it("should create a job (employer)", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          employer_id: 2,
          title: "Senior Engineer",
          status: "active",
          created_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Senior Engineer",
        description: "We are hiring.",
        location: "New York, NY",
        salaryMin: 100000,
        salaryMax: 150000,
        employmentType: "full-time",
      });

    expect(res.status).toBe(201);
    expect(res.body.job).toBeDefined();
  });

  it("should not allow candidate to create a job", async () => {
    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        title: "Hacked",
        description: "x",
        location: "NY",
        employmentType: "full-time",
      });

    expect(res.status).toBe(403);
  });

  it("should list jobs with filters", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: "2" }] });
    query.mockResolvedValueOnce({
      rows: [
        { id: 1, title: "Job A", employer_id: 2, created_at: new Date() },
        { id: 2, title: "Job B", employer_id: 2, created_at: new Date() },
      ],
    });

    const res = await request(app)
      .get("/api/v1/jobs")
      .query({ category: "Engineering", location: "NY", page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it("should get job by id", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          title: "Senior Engineer",
          employer_id: 2,
          created_at: new Date(),
        },
      ],
    });

    const res = await request(app).get("/api/v1/jobs/1");
    expect(res.status).toBe(200);
    expect(res.body.job.id).toBe(1);
  });

  it("should return 404 for missing job", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get("/api/v1/jobs/999");
    expect(res.status).toBe(404);
  });

  it("should allow employer to update own job", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          employer_id: 2,
          title: "Senior Engineer - Updated",
          status: "active",
          updated_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .put("/api/v1/jobs/1")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({ title: "Senior Engineer - Updated" });

    expect(res.status).toBe(200);
    expect(res.body.job.title).toBe("Senior Engineer - Updated");
  });

  it("should allow employer to delete own job", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await request(app)
      .delete("/api/v1/jobs/1")
      .set("Authorization", `Bearer ${employerToken}`);
    expect(res.status).toBe(204);
  });

  it("should get employer jobs", async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 1, title: "Job A", employer_id: 2, created_at: new Date() }],
    });

    const res = await request(app)
      .get("/api/v1/jobs/employer/my-jobs")
      .set("Authorization", `Bearer ${employerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
  });

  it("should create a featured job (employer)", async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 3, employer_id: 2, title: "Featured Job", is_featured: true, status: "active", created_at: new Date() }],
    });

    const res = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Featured Job",
        description: "We are hiring.",
        location: "New York, NY",
        salaryMin: 100000,
        salaryMax: 150000,
        employmentType: "full-time",
        isFeatured: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.job.is_featured).toBe(true);
  });

  it("should list featured jobs", async () => {
    query.mockResolvedValueOnce({ rows: [{ count: "1" }] });
    query.mockResolvedValueOnce({
      rows: [{ id: 3, title: "Featured Job", employer_id: 2, is_featured: true, created_at: new Date() }],
    });

    const res = await request(app).get("/api/v1/jobs/featured");
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].is_featured).toBe(true);
  });
});

describe("Applications API", () => {
  const employerToken = signAccessToken(employerRow);
  const candidateToken = signAccessToken(candidateRow);

  it("should apply to a job (candidate)", async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 1, employer_id: 2, title: "Job", status: "active" }],
    });
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          job_id: 1,
          applicant_id: 1,
          status: "applied",
          created_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .post("/api/v1/applications/jobs/1/apply")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({ coverLetter: "I am interested." });

    expect(res.status).toBe(201);
    expect(res.body.application).toBeDefined();
  });

  it("should get my applications", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          job_id: 1,
          applicant_id: 1,
          status: "applied",
          created_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .get("/api/v1/applications/my")
      .set("Authorization", `Bearer ${candidateToken}`);
    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
  });

  it("should update application status (employer)", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          job_id: 1,
          applicant_id: 1,
          status: "reviewing",
          updated_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .patch("/api/v1/applications/7/status")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({ status: "reviewing" });

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe("reviewing");
  });

  it("should forbid candidate from updating application status", async () => {
    const res = await request(app)
      .patch("/api/v1/applications/7/status")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({ status: "hired" });
    expect(res.status).toBe(403);
  });
});

describe("Profiles API", () => {
  const candidateToken = signAccessToken(candidateRow);

  it("should create candidate profile", async () => {
    query.mockResolvedValueOnce({ rows: [] }); // getByUserId: none
    query.mockResolvedValueOnce({
      rows: [{ id: 1, user_id: 1, skills: "[]", created_at: new Date() }],
    });

    const res = await request(app)
      .post("/api/v1/candidates")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        headline: "Software Engineer",
        skills: ["JavaScript", "Node.js"],
      });

    expect(res.status).toBe(200);
    expect(res.body.candidate).toBeDefined();
  });
});

describe("Employer Profiles API", () => {
  const employerToken = signAccessToken(employerRow);
  const candidateToken = signAccessToken(candidateRow);

  function signAccessToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      require("../src/config").jwt.secret,
      { expiresIn: "15m" },
    );
  }

  it("should create employer profile", async () => {
    query.mockResolvedValueOnce({ rows: [] }); // getByUserId: none
    query.mockResolvedValueOnce({
      rows: [{ id: 1, user_id: 2, company_name: "Acme Corp", created_at: new Date() }],
    });

    const res = await request(app)
      .post("/api/v1/employers")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        companyName: "Acme Corp",
        description: "A great company.",
        branding: { color: "blue" },
        careersPageUrl: "https://acme.com/careers",
      });

    expect(res.status).toBe(200);
    expect(res.body.employer).toBeDefined();
  });

  it("should forbid candidate from creating employer profile", async () => {
    const res = await request(app)
      .post("/api/v1/employers")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({ companyName: "Acme Corp" });

    expect(res.status).toBe(403);
  });
});

describe("Health", () => {
  it("should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
