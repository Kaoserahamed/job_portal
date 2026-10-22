const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const COMMON_SKILLS = [
  "javascript", "typescript", "python", "java", "c#", "c++", "ruby", "php", "go", "rust",
  "swift", "kotlin", "scala", "dart", "node.js", "react", "angular", "vue", "next.js",
  "django", "flask", "spring", "express", "laravel", "sql", "postgresql", "mysql",
  "mongodb", "redis", "elasticsearch", "aws", "azure", "gcp", "docker", "kubernetes",
  "terraform", "git", "jenkins", "github actions", "html", "css", "sass", "webpack",
  "rest", "graphql", "grpc", "linux", "unix", "agile", "scrum", "jira", "figma",
  "machine learning", "artificial intelligence", "data analysis", "pandas", "numpy",
  "tensorflow", "pytorch", "spark", "hadoop", "tableau", "powerbi", "excel", "unity",
  "unreal",
];

function extractSkills(text) {
  const lower = (text || "").toLowerCase();
  const found = [];
  for (const skill of COMMON_SKILLS) {
    if (lower.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }
  return [...new Set(found)];
}

function extractExperience(text) {
  const lower = (text || "").toLowerCase();
  let maxYears = 0;
  const matches = lower.match(/(\d+)\s*(?:\+?\s*)year[s]?/g) || [];
  for (const m of matches) {
    const num = parseInt(m, 10);
    if (!isNaN(num) && num > maxYears) maxYears = num;
  }
  return maxYears > 0 ? maxYears : null;
}

async function parsePdf(buffer) {
  const data = await pdf(buffer);
  return data.text || "";
}

async function parseDocx(buffer) {
  const result = await mammoth.extract({ buffer });
  return result.value || "";
}

async function parseResume(buffer, mimetype) {
  let text = "";
  if (mimetype === "application/pdf") {
    text = await parsePdf(buffer);
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await parseDocx(buffer);
  } else {
    throw new Error("Unsupported file type");
  }
  return {
    text,
    parsedText: text,
    skillsExtracted: extractSkills(text),
    experienceYears: extractExperience(text),
  };
}

module.exports = {
  parseResume,
  extractSkills,
  extractExperience,
  parsePdf,
  parseDocx,
};
