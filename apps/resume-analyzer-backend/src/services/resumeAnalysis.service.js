"use strict";
const axios = require("axios");
const mammoth = require("mammoth");
const { groq } = require("../config/groq");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const FREE_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

const ROLE_SKILLS = {
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "TypeScript",
    "Responsive Design",
    "APIs",
    "Next.js",
    "Tailwind CSS",
  ],
  "Backend Developer": [
    "Node.js",
    "Express",
    "Databases",
    "MongoDB",
    "SQL",
    "REST APIs",
    "Auth",
    "System Design",
    "Microservices",
  ],
  "Java Developer": [
    "Java",
    "OOP",
    "Spring Boot",
    "SQL",
    "Hibernate",
    "REST",
    "Microservices",
    "Maven",
    "JPA",
  ],
  "React Native Developer": [
    "React Native",
    "JavaScript",
    "TypeScript",
    "Mobile UI",
    "APIs",
    "State Management",
    "Redux",
    "iOS/Android Deployment",
  ],
};

/**
 * Centrally managed AI invocation with automatic model failover for 429 errors.
 */
async function callGroqWithFailover(payload, options = {}) {
  const preferredModel = process.env.GROQ_MODEL;
  // Create a priority list: [User Preferred Model, ...Standard Free Pool]
  const modelPool = Array.from(
    new Set([...(preferredModel ? [preferredModel] : []), ...FREE_MODELS]),
  );

  let lastError = null;

  for (let i = 0; i < modelPool.length; i++) {
    const currentModel = modelPool[i];
    try {
      console.log(
        `[AI Engine] Attempting request with model: ${currentModel} (Attempt ${i + 1}/${modelPool.length})`,
      );

      const response = await groq.chat.completions.create({
        ...payload,
        model: currentModel,
      });

      return response;
    } catch (error) {
      lastError = error;
      const isRateLimit =
        error.status === 429 ||
        error.message?.includes("rate_limit_exceeded") ||
        error.message?.includes("Rate limit reached");

      if (isRateLimit && i < modelPool.length - 1) {
        console.warn(
          `[AI Engine] Rate limit hit for ${currentModel}. Switching to ${modelPool[i + 1]}...`,
        );
        continue; // Try next model
      }

      // If it's not a rate limit, or we've exhausted all models, throw
      console.error(
        `[AI Engine] Permanent failure on ${currentModel}:`,
        error.message,
      );
      throw error;
    }
  }

  throw (
    lastError ||
    new Error("AI call failed after exhausting all available models.")
  );
}

// ─────────────────────────────────────────────
//  PDF TEXT EXTRACTION  (fixed pdf-parse usage)
// ─────────────────────────────────────────────
async function extractTextFromPdf(input) {
  try {
    let buffer = input;

    // If a URL string is passed, download it first
    if (typeof input === "string" && input.startsWith("http")) {
      console.log("[PDF] Downloading from URL:", input.substring(0, 60));
      const resp = await axios.get(input, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      buffer = Buffer.from(resp.data);
    }

    if (!buffer || buffer.length === 0) {
      throw new Error("Empty buffer received for PDF extraction");
    }

    const pdf = require("pdf-parse");
    let extractedData = null;

    if (typeof pdf === "function") {
      // Standard pdf-parse functional usage
      console.log("[PDF] Using functional extraction engine");
      extractedData = await pdf(buffer);
    } else if (pdf.PDFParse) {
      // pdf-parse fork with class-based usage
      console.log("[PDF] Using class-based extraction engine");
      const parser = new pdf.PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      extractedData = { text: result.text };
    } else {
      throw new Error("Unable to locate valid pdf-parse extraction patterns.");
    }

    const text = (extractedData.text || "").trim();
    console.log(`[PDF] Extracted ${text.length} characters.`);

    if (text.length < 20) {
      throw new Error(
        `Validation Error: Extracted text too short (${text.length} chars). Please ensure your PDF is not a scanned image and contains readable text.`,
      );
    }

    return text;
  } catch (err) {
    console.error("[PDF] Extraction failed:", err.message);
    // Preserving the prefix if it's already a Validation Error
    if (err.message.includes("Validation Error:")) throw err;
    throw new Error("PDF extraction failed: " + err.message);
  }
}

// ─────────────────────────────────────────────
//  DOCX TEXT EXTRACTION
// ─────────────────────────────────────────────
async function extractTextFromDocx(input) {
  try {
    let buffer = input;

    if (typeof input === "string" && input.startsWith("http")) {
      console.log("[DOCX] Downloading from URL:", input.substring(0, 60));
      const resp = await axios.get(input, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      buffer = Buffer.from(resp.data);
    }

    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || "").trim();

    console.log(`[DOCX] Extracted ${text.length} characters`);

    if (text.length < 50) {
      throw new Error(
        `Validation Error: Extracted text too short (${text.length} chars). Please ensure your document contains readable text.`,
      );
    }

    return text;
  } catch (err) {
    console.error("[DOCX] Extraction failed:", err.message);
    if (err.message.includes("Validation Error:")) throw err;
    throw new Error("DOCX extraction failed: " + err.message);
  }
}

// ─────────────────────────────────────────────
//  DYNAMIC PROMPT HELPERS
// ─────────────────────────────────────────────

/**
 * Replaces {{variable}} placeholders with actual data.
 */
function injectVariables(template, data) {
  let result = template;
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, data[key] || "");
  });
  return result;
}

async function getPromptsFromDB() {
  try {
    const prompts = await prisma.aIPrompt.findMany({
      where: { isActive: true },
    });
    const dict = {};
    prompts.forEach((p) => (dict[p.key] = p.content));
    return dict;
  } catch (err) {
    console.warn("[Prompts] Failed to fetch dynamic prompts:", err.message);
    return {};
  }
}

// ─────────────────────────────────────────────
//  GROQ AI — RESUME ANALYSIS
// ─────────────────────────────────────────────
function buildAnalysisPrompt(
  resumeText,
  userType = null,
  targetRole = null,
  yearsOfExperience = null,
  roleSkills = ROLE_SKILLS,
  customTemplate = null,
) {
  let roleSection = "";

  if (targetRole) {
    const skills = roleSkills[targetRole];
    const skillList = skills
      ? Array.isArray(skills)
        ? skills.join(", ")
        : skills
      : "General engineering skills";

    roleSection = `
═══════════════════════════════════════════════════════════════
TARGET ROLE: ${targetRole}
MANDATORY SKILLS FOR THIS ROLE: [${skillList}]
CANDIDATE TYPE: ${userType === "FRESHER" ? "FRESHER (No work experience)" : `EXPERIENCED (${yearsOfExperience || "N/A"} years)`}
═══════════════════════════════════════════════════════════════

ROLE-SPECIFIC SCORING ENFORCEMENT (CRITICAL — READ CAREFULLY):
- You MUST score this resume EXCLUSIVELY for the role of "${targetRole}".
- The MANDATORY SKILLS listed above are the PRIMARY scoring criteria for "keywords" and "techSkills".
- For EACH mandatory skill that is COMPLETELY ABSENT from the resume, deduct 2-3 points from "keywords" (max 20).
- If the resume has ZERO overlap with [${skillList}], then "keywords" MUST be 0-3 and "techSkills" MUST be 0-2.
- If the candidate's domain is COMPLETELY DIFFERENT (e.g., Chef resume for Backend Developer), total score MUST be 10-20.
- If the candidate has SOME transferable skills but is in a DIFFERENT domain, total score MUST be 25-40.
- Only give "keywords" above 15 if the resume contains MOST of the mandatory skills.
${
  userType === "FRESHER"
    ? `- FRESHER CALIBRATION:
  * DO NOT penalize for "lack of professional work experience" or "short tenure".
  * Evaluate "Experience Quality" based on Academic Projects, Internships, Freelancing, and Open Source.
  * If the candidate has good projects but zero job history, DO NOT list "Experience gap" as a weakness.
  * Focus on learning agility and foundational skill depth.`
    : `- EXPERIENCED (${yearsOfExperience || "N/A"} YoE) CALIBRATION:
  * Require production-level usage of mandatory skills.
  * Penalize if the years of experience don't match the depth of achievements.`
}
`;
  }

  return `You are a Tier-1 Technical Recruiter and ATS Specialist.
${roleSection}

STEP 1: DOCUMENT VALIDATION
First, determine if the text below is a professional Resume, CV, or Profile.
* ONLY return false if the content is completely unrelated (e.g. food recipe, random gibberish).
* IF it contains any name, contact info, skills, or projects, treat it as a Resume.
If it is NOT a resume (e.g., project report, book, invoice, random text), return ONLY:
{ "isResume": false, "error": "This document does not appear to be a professional resume or CV. Please upload a valid resume." }

STEP 2: ROLE-TARGETED ATS ANALYSIS
Analyze THIS resume specifically for the "${targetRole || "General"}" role.

SCORING RUBRIC (Max 100 pts):
1.  Keyword Density (20 pts): How many MANDATORY SKILLS from the target role appear in the resume? If none match = 0-3. If all match = 16-20.
2.  Quantifiability (15 pts): Measurable impact with numbers (%, $, #).
3.  Technical Depth (10 pts): Depth of knowledge in the TARGET ROLE's tech stack specifically. Generic/unrelated skills = 0-2.
4.  Experience Quality (10 pts): Work experience RELEVANT to the target role only.
5.  Education (8 pts): Degree relevance to the target role's domain.
6.  Projects (8 pts): Projects demonstrating TARGET ROLE skills.
7.  Formatting (7 pts): ATS-friendly, clean structure.
8.  Summary (6 pts): Value proposition aligned with the target role.
9.  Certifications (5 pts): Certifications relevant to the target role.
10. Online Presence (5 pts): GitHub/LinkedIn/Portfolio with relevant work.
11. Soft Skills (4 pts): Leadership, collaboration, communication.
12. Grammar (2 pts): Professional tone, zero typos.

SCORING CALIBRATION:
- Resume with NO relevant skills for "${targetRole || "target role"}": 10-25 pts MAXIMUM.
- Resume from DIFFERENT domain with some transferable skills: 25-40 pts.
- Generic student resume, partially relevant: 35-55 pts.  
- Good resume with most target skills present: 55-75 pts.
- Excellent resume perfectly aligned to target role: 75-90 pts.
- Expert with deep domain mastery + leadership: 85-100 pts.

Return ONLY valid JSON (no markdown, no explanation):
{
  "isResume": true,
  "breakdown": {
    "keywords": 0-20,
    "achievements": 0-15,
    "techSkills": 0-10,
    "experience": 0-10,
    "education": 0-8,
    "projects": 0-8,
    "formatting": 0-7,
    "summary": 0-6,
    "certifications": 0-5,
    "onlinePresence": 0-5,
    "softSkills": 0-4,
    "grammar": 0-2
  },
  "keywordsMissing": ["specific skills from MANDATORY list that are MISSING from the resume"],
  "suggestions": ["4-5 actions to improve fit for ${targetRole || "the target role"}"],
  "topStrengths": ["Exactly 4 strengths relevant to ${targetRole || "the role"}"],
  "weaknesses": ["Exactly 4 gaps/weaknesses for ${targetRole || "the role"}"],
  "experienceLevel": "Entry | Mid | Senior",
  "summaryAnalysis": "6-8 line critique: How well does this candidate fit '${targetRole || "the role"}'? What mandatory skills are missing? What domain-specific improvements are needed?"
}

RESUME PAYLOAD:
---
${resumeText.slice(0, 8000)}
---`;
}

function buildMatchPrompt(resumeText, jobDescription, options = {}) {
  const { userType, targetRole, yearsOfExperience } = options;

  return `You are a Tier-1 Technical Recruiter and ATS Specialist. Your task is to perform an exhaustive, BRUTALLY HONEST comparison between a Candidate's Resume and a specific Job Description (JD).

═══════════════════════════════════════════════════════════════
JOB DESCRIPTION CONTEXT:
${jobDescription.slice(0, 4000)}
═══════════════════════════════════════════════════════════════

CANDIDATE TYPE: ${userType === "FRESHER" ? "FRESHER (No work experience)" : `EXPERIENCED (${yearsOfExperience || "N/A"} years)`}

STEP 1: DOCUMENT VALIDATION
First, verify that the 'RESUME PAYLOAD' (provided below) is a professional Resume, CV, or Profile. 
* ONLY return false if the content is completely unrelated (e.g. food recipe, random gibberish, a movie script).
* IF it contains any name, contact info, skills, or even just academic projects, treat it as a Resume.
If it is NOT a resume, you MUST return:
{ "isResume": false, "error": "The uploaded document is not a professional resume. Job matching requires a valid resume payload." }

STEP 2: PIN-POINTED ATS ALIGNMENT ANALYSIS
If it IS a resume, analyze its match against the JD using this 100-point rubric:

SCORING RUBRIC (Max 100 pts):
1.  Skill Alignment (40 pts): Match of mandatory technical skills found in JD vs those in Resume. 
2.  Experience Relevance (30 pts): Does the work history align with the JD's level and responsibilities? 
3.  Keyword Match (20 pts): Frequency and relevance of industry terms from the JD.
4.  Strategic Impact (10 pts): Does the candidate's achievements show they can solve the problems implied in the JD?

${
  userType === "FRESHER"
    ? `- FRESHER CALIBRATION:
  * DO NOT penalize for "lack of professional work experience" or "short tenure".
  * Evaluate "Experience Relevance" based on Academic Projects, Internships, Freelancing, and Open Source.
  * If the candidate has good projects but zero job history, DO NOT list "Experience gap" as a weakness.
  * Focus on learning agility and foundational skill depth.`
    : `- EXPERIENCED (${yearsOfExperience || "N/A"} YoE) CALIBRATION:
  * Require production-level usage of mandatory skills.
  * Penalize if the years of experience don't match the depth of achievements.`
}

CRITICAL MATCHING RULES (STRICT):
- If the JD is random text or unrelated to the candidate's field (e.g., Coder vs Chef), score MUST be below 20.
- If the candidate misses 30%+ of the mandatory tech stack, score MUST be below 50.

Return ONLY valid JSON (no markdown, no preamble):
{
  "isResume": true,
  "breakdown": {
    "skillAlignment": 0-40,
    "experienceRelevance": 0-30,
    "keywords": 0-20,
    "impact": 0-10
  },
  "keywordsMissing": ["Top 8-10 missing tech/soft skills found in JD"],
  "suggestions": ["4-5 specific actions to optimize this resume for THIS job description"],
  "topStrengths": ["4 specific areas where the candidate is a perfect match vs JD"],
  "weaknesses": ["4 specific gaps/weaknesses relative to THIS specific role"],
  "experienceLevel": "Entry | Mid | Senior",
  "summaryAnalysis": "Strategic Verdict (6-8 lines): A critical assessment of the candidate's 'Hireability' for this specific role. Identify exactly why they will or will not pass the initial screening."
}

RESUME PAYLOAD:
---
${resumeText.slice(0, 8000)}
---`;
}

async function analyzeResumeText(
  resumeText,
  jobDescription = null,
  options = {},
) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not found");

  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error("Resume content too short to analyze.");
  }

  // --- Dynamic Config Loading ---
  let dynamicRoleSkills = ROLE_SKILLS;
  try {
    const tracks = await prisma.jobTrack.findMany({
      where: { isActive: true },
    });
    if (tracks.length > 0) {
      dynamicRoleSkills = {};
      tracks.forEach((t) => {
        dynamicRoleSkills[t.name] = t.skills;
      });
    }
  } catch (dbErr) {
    console.warn("[Analysis] Using fallback role skills:", dbErr.message);
  }

  // Handle dynamic prompts (Optional: logic to swap buildAnalysisPrompt with DB content)
  // For now, we'll pass the dynamicRoleSkills to the prompt builder if needed
  // ...

  // Always use the built-in prompts which have the correct JSON schema
  // that the scoring function (gv) expects. DB prompt templates can override
  // if they are well-tested, but for now the built-in prompts are reliable.
  let prompt;

  if (jobDescription) {
    prompt = buildMatchPrompt(resumeText, jobDescription, options);
  } else {
    prompt = buildAnalysisPrompt(
      resumeText,
      options.userType,
      options.targetRole,
      options.yearsOfExperience,
      dynamicRoleSkills,
    );
  }

  try {
    const response = await callGroqWithFailover({
      messages: [
        {
          role: "system",
          content:
            "You are a specialized ATS grading system. Respond with valid JSON ONLY.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content || "";
    console.log("[Groq] Raw AI Response Preview:", raw.substring(0, 500));

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Groq] No JSON found in response:", raw);
      throw new Error("Invalid AI Response format (No JSON)");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Handle Document Validation Failure
    if (parsed.isResume === false) {
      console.warn("[Groq] Validation Failed:", parsed.error);
      throw new Error(
        `Validation Error: ${parsed.error || "The uploaded document is not a professional resume. Please upload a valid resume."}`,
      );
    }

    // Handle both { breakdown: {...} } and top-level keys
    const b = parsed.breakdown || parsed.scoreBreakdown || parsed;

    // Helper to extract numeric values from potential hallucinations
    const gv = (keys, max) => {
      for (const k of keys) {
        if (b[k] !== undefined && b[k] !== null) {
          const val = Number(b[k]);
          return isNaN(val) ? 0 : Math.min(val, max);
        }
      }
      return 0;
    };

    // Robust Scoring Logic
    const breakdown = jobDescription
      ? {
          skillAlignment: gv(["skillAlignment", "skills"], 40),
          experienceRelevance: gv(["experienceRelevance", "experience"], 30),
          keywords: gv(["keywords", "keywordMatch"], 20),
          impact: gv(["impact", "achievements"], 10),
        }
      : {
          keywords: gv(["keywords", "keyword_density", "keywordMatch"], 20),
          achievements: gv(["achievements", "quantifiability", "impact"], 15),
          techSkills: gv(["techSkills", "technical_depth", "skills"], 10),
          experience: gv(
            ["experience", "experience_quality", "workHistory"],
            10,
          ),
          education: gv(["education", "academic", "credentials"], 8),
          projects: gv(["projects", "portfolio", "side_projects"], 8),
          formatting: gv(["formatting", "ats_compliance", "structure"], 7),
          summary: gv(["summary", "professional_summary", "valueProp"], 6),
          certifications: gv(["certifications", "certs", "licenses"], 5),
          onlinePresence: gv(["onlinePresence", "links", "presence"], 5),
          softSkills: gv(["softSkills", "leadership", "mentoring"], 4),
          grammar: gv(["grammar", "language", "typos"], 2),
        };

    const calcScore = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
    const atsScore = Math.min(100, Math.max(0, Math.round(calcScore)));

    console.log(`[Groq] Final Calculated Score: ${atsScore}`);

    return {
      atsScore,
      scoreBreakdown: breakdown,
      keywordsMissing: Array.isArray(parsed.keywordsMissing)
        ? parsed.keywordsMissing.slice(0, 10)
        : [],
      jobsMatched: atsScore > 80 ? 15 : atsScore > 60 ? 8 : 3,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 5)
        : [],
      trends: Array.isArray(parsed.topStrengths) ? parsed.topStrengths : [],
      skillsExtracted: Array.isArray(parsed.skillsExtracted)
        ? parsed.skillsExtracted
        : breakdown.techSkills > 0
          ? ["Extracted Skills"]
          : [],
      summary: parsed.summaryAnalysis || parsed.summary || "",
      experienceLevel: parsed.experienceLevel || "Entry",
      topStrengths: Array.isArray(parsed.topStrengths)
        ? parsed.topStrengths.slice(0, 4)
        : [],
      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses.slice(0, 4)
        : [],
    };
  } catch (error) {
    console.error("[Groq] Analysis failed:", error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────
//  GROQ AI — CAREER ROADMAP
// ─────────────────────────────────────────────
async function generateCareerRoadmap(analysisData) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const prompt = `Generate a personalized career roadmap as a JSON object. 
Return ONLY valid JSON. No markdown, no text outside the JSON.

Format:
{
  "phases": [
    {
      "title": "Phase 1: ...",
      "objective": "2-sentence objective explaining the goal",
      "status": "Recommended",
      "priority": "High",
      "difficulty": "Beginner",
      "estimatedDays": 30,
      "steps": ["Step 1", "Step 2", "Step 3"],
      "project": {
        "title": "Project Name",
        "description": "Brief description with technologies used"
      }
    }
  ]
}

Context:
- Experience Level: ${analysisData.experienceLevel || "Unknown"}
- Extracted Skills: ${JSON.stringify(analysisData.skillsExtracted?.slice(0, 10) || [])}
- Missing Critical Skills: ${JSON.stringify(analysisData.keywordsMissing?.slice(0, 8) || [])}
- Key Weaknesses: ${JSON.stringify(analysisData.weaknesses?.slice(0, 5) || [])}

Generate 3-4 phases that are specific, realistic, and actionable.`;

  try {
    const response = await callGroqWithFailover({
      messages: [
        {
          role: "system",
          content: "You generate career roadmaps as strictly valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON in roadmap response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Groq] Roadmap generation error:", error.message);
    // Graceful fallback
    return {
      phases: [
        {
          title: "Phase 1: Skill Gap Remediation",
          objective: `Focus on acquiring the missing skills identified in your analysis: ${(analysisData.keywordsMissing || []).slice(0, 3).join(", ")}.`,
          status: "Recommended",
          priority: "High",
          difficulty: "Intermediate",
          estimatedDays: 30,
          steps: (analysisData.keywordsMissing || [])
            .slice(0, 4)
            .map((s) => `Learn and practice ${s}`),
          project: {
            title: "Skill Showcase Project",
            description:
              "Build a project that demonstrates your newly acquired skills.",
          },
        },
      ],
    };
  }
}

// ─────────────────────────────────────────────
//  GROQ AI — RESUME DATA EXTRACTION (For Resume Maker)
// ─────────────────────────────────────────────
async function extractResumeData(resumeText) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not found");

  const prompt = `You are a specialized Data Extraction AI. 
Extract all professional details from the resume below into a perfectly structured JSON object.
Capture EVERY detail accurately.

Return ONLY this JSON structure:
{
  "fullName": "Name",
  "phone": "Phone",
  "email": "Email",
  "linkedin": "URL",
  "portfolio": "URL",
  "github": "URL",
  "location": "City, Country",
  "targetRole": "Extrapolated current/target role",
  "summary": "Full professional summary",
  "skills": ["Skill 1", "Skill 2"],
  "languages": "List of languages",
  "frameworks": "List of frameworks",
  "cloud": "Cloud platforms",
  "certifications": "Certifications",
  "experience": [
    {
      "role": "Title",
      "company": "Company",
      "startDate": "Date",
      "endDate": "Date",
      "location": "Location",
      "highlights": ["Bullet point 1", "Bullet point 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree",
      "field": "Field",
      "university": "University",
      "year": "Year"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "techStack": "Tools used",
      "highlights": ["What you did", "Impact"]
    }
  ],
  "achievements": [
    { "label": "Revenue Growth", "value": "25%" }
  ]
}

RESUME:
---
${resumeText.slice(0, 8000)}
---`;

  try {
    const response = await callGroqWithFailover({
      messages: [
        {
          role: "system",
          content:
            "You extract structured resume data. Respond with valid JSON ONLY.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in extraction response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[Groq] Extraction failed:", error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────
//  GROQ AI — JD OPTIMIZATION (For Resume Maker)
// ─────────────────────────────────────────────
// async function optimizeResumeForJD(resumeData, jobDescription) {
//   if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not found");

//   const prompt = `You are a World-Class Resume Strategist and ATS Specialist.
// Your goal is to RE-ENGINEER the provided resume data to MAXIMIZE its match rate against the specific Job Description (JD).

// STRATEGIC INSTRUCTIONS:
// 1.  PERSONALIZED SUMMARY (CAREER OBJECTIVE): Rewrite the 'summary' from scratch to be a high-impact branding statement. It must use keywords from the JD and explicitly state how the candidate solves the specific problems mentioned in the JD.
// 2.  SKILLS SYNCHRONIZATION (CORE CAPABILITIES): Reorganize and update the 'skills' array. Prioritize the technical and soft skills highlighted in the JD. Ensure terminology exactly matches the JD (e.g., if JD says "Cloud Architecture", don't just say "AWS").
// 3.  EXPERIENCE OPTIMIZATION: Rephrase 'highlights' for every role to emphasize accomplishments that are directly relevant to the JD's requirements. Use action verbs and quantifiable metrics where possible.
// 4.  PROJECT ALIGNMENT: Tailor the 'projects' highlights to showcase relevance to the JD's tech stack and objectives.
// 5.  VERACITY & INTEGRITY: Do not invent new jobs, dates, degrees, or companies. Stay honest to the candidate's core history.

// EXTREME IMPORTANCE:
// - The tone should be authoritative, professional, and JD-aligned.
// - Return ONLY the full updated JSON object of the resume data.

// RESUME DATA:
// ${JSON.stringify(resumeData, null, 2)}

// JOB DESCRIPTION:
// ${jobDescription}

// Return the optimized JSON object now.`;

//   try {
//     const response = await callGroqWithFailover({
//       messages: [
//         { role: "system", content: "You optimize resume data for JD alignment. Respond with valid JSON ONLY." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.3,
//     });

//     const raw = response.choices[0]?.message?.content || "";
//     const jsonMatch = raw.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("No JSON found in optimization response");

//     return JSON.parse(jsonMatch[0]);
//   } catch (error) {
//     console.error("[Groq] Optimization failed:", error.message);
//     throw error;
//   }
// }

async function optimizeResumeForJD(resumeData, jobDescription) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not found");
  }

  const prompt = `
You are a World-Class Resume Strategist and ATS Specialist.

Your goal is to RE-ENGINEER the provided resume data to MAXIMIZE its match rate against the specific Job Description (JD).

STRATEGIC INSTRUCTIONS:

1. PERSONALIZED SUMMARY:
Rewrite the summary using JD keywords.

2. SKILLS SYNCHRONIZATION:
Prioritize technical and soft skills from JD.

3. EXPERIENCE OPTIMIZATION:
Improve highlights using measurable impact.

4. PROJECT ALIGNMENT:
Tailor projects toward JD relevance.

5. VERACITY:
Do NOT invent fake experience.

IMPORTANT:
Return ONLY VALID JSON.
No markdown.
No explanation.
No extra text.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}
`;

  try {
    const response = await callGroqWithFailover({
      messages: [
        {
          role: "system",
          content: "Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.3,
    });

    const raw = response.choices?.[0]?.message?.content || "";

    console.log("[OPTIMIZATION RAW RESPONSE]", raw);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("[OPTIMIZATION ERROR] No JSON found");

      throw new Error("No JSON found in optimization response");
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);

      console.log("[OPTIMIZATION PARSED SUCCESSFULLY]");

      return parsed;
    } catch (parseError) {
      console.error("[OPTIMIZATION JSON PARSE ERROR]", parseError);

      console.error("[BROKEN JSON]", jsonMatch[0]);

      throw new Error("Failed to parse optimization JSON");
    }
  } catch (error) {
    console.error("[Groq] Optimization failed:", error.message);

    throw error;
  }
}

/**
 * Extracts structured job details from raw JD text using AI (Groq).
 */
async function extractStructuredJDText(text) {
  try {
    const prompt = `
      You are an expert HR recruitment assistant. Your task is to extract job role details from the provided Job Description text.
      Return the data ONLY as a valid and clean JSON object.
      
      The JSON object MUST have these fields:
      - title: The official job title
      - company: The hiring company name
      - location: Remote, or a specific city/country
      - type: One of ["Full-time", "Part-time", "Contract", "Remote", "Internship"]
      - experience: Experience required (e.g. "3+ Years")
      - description: A concise 2-3 sentence overview of the role
      - requirements: A list of candidate requirements (bullet points)
      - responsibilities: A list of job responsibilities (bullet points)
      - tags: A list of 5-10 key technical skills required
      
      Job Description:
      """
      ${text}
      """
    `;

    const response = await callGroqWithFailover({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Ensure lists are formatted correctly
    if (Array.isArray(result.requirements))
      result.requirements = result.requirements.join("\n");
    if (Array.isArray(result.responsibilities))
      result.responsibilities = result.responsibilities.join("\n");

    return result;
  } catch (error) {
    console.error("[JD Extraction] AI parsing failed:", error.message);
    throw error;
  }
}

module.exports = {
  analyzeResumeText,
  buildAnalysisPrompt,
  extractTextFromPdf,
  extractTextFromDocx,
  extractResumeData,
  optimizeResumeForJD,
  extractStructuredJDText,
  generateCareerRoadmap,
};
