jest.mock("../src/config/database", () => ({
  query: jest.fn(),
  pool: { end: jest.fn() },
}));
jest.mock("pdf-parse", () =>
  jest.fn(() => Promise.resolve({ text: "Parsed resume text with JavaScript and React. 5 years of experience." })),
);
jest.mock("mammoth", () => ({
  extract: jest.fn(() => Promise.resolve({ value: "DOCX resume text with Python and SQL." })),
}));

const { query } = require("../src/config/database");
const ResumeService = require("../src/modules/resume/service");
const ResumeController = require("../src/modules/resume/controller");

const { parseResume, extractSkills, extractExperience } = ResumeService;

describe("Resume parsing service", () => {
  it("extracts skills from text", () => {
    expect(extractSkills("I know JavaScript, Node.js and Python")).toContain(
      "javascript",
    );
    expect(extractSkills("Java and C++")).toContain("java");
    expect(extractSkills("C++ and rust")).toContain("c++");
    expect(extractSkills("Nothing relevant here")).toEqual([]);
  });

  it("extracts experience years", () => {
    expect(extractExperience("5 years of experience")).toBe(5);
    expect(extractExperience("10+ years in the field")).toBe(10);
    expect(extractExperience("No experience mentioned")).toBeNull();
    expect(extractExperience("")).toBeNull();
  });

  it("parses a PDF resume", async () => {
    const result = await parseResume(Buffer.from("fake-pdf"), "application/pdf");
    expect(result.parsedText).toContain("Parsed resume text");
    expect(result.skillsExtracted).toContain("javascript");
    expect(result.experienceYears).toBe(5);
  });

  it("parses a DOCX resume", async () => {
    const result = await parseResume(
      Buffer.from("fake-docx"),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(result.parsedText).toBe("DOCX resume text with Python and SQL.");
    expect(result.skillsExtracted).toContain("python");
    expect(result.experienceYears).toBeNull();
  });

  it("throws on unsupported file type", async () => {
    await expect(
      parseResume(Buffer.from("x"), "image/png"),
    ).rejects.toThrow("Unsupported file type");
  });
});

describe("Resume controller", () => {
  const candidateUser = { userId: 1 };

  beforeEach(() => {
    query.mockReset();
  });

  it("should upload and parse a resume", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          candidate_id: 1,
          file_url: null,
          parsed_text: "Parsed resume text",
          skills_extracted: ["javascript", "react"],
          experience_years: 5,
          created_at: new Date(),
        },
      ],
    });

    const req = {
      user: candidateUser,
      file: {
        buffer: Buffer.from("fake-pdf"),
        mimetype: "application/pdf",
        originalname: "resume.pdf",
        size: 123,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await ResumeController.upload(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      resume: expect.objectContaining({
        candidate_id: 1,
        skills_extracted: ["javascript", "react"],
        experience_years: 5,
      }),
    });
  });

  it("should return 400 when no file is uploaded", async () => {
    const req = { user: candidateUser, file: undefined };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await ResumeController.upload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded" });
  });

  it("should get a resume by id", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          candidate_id: 1,
          file_url: null,
          parsed_text: "Parsed text",
          skills_extracted: ["javascript"],
          experience_years: 3,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    });

    const req = { params: { id: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await ResumeController.getById(req, res);

    expect(res.json).toHaveBeenCalledWith({
      resume: expect.objectContaining({ id: 1, candidate_id: 1 }),
    });
  });

  it("should return 404 for missing resume", async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const req = { params: { id: "999" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await ResumeController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
