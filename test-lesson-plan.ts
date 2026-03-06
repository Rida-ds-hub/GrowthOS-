/**
 * Run analyseRepo + generateLessonPlan for a repo and print the lesson plan.
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' test-lesson-plan.ts
 * Requires .env.local with GEMINI_API_KEY for lesson plan generation.
 */

import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) {
      const val = m[2].trim().replace(/^["']|["']$/g, "");
      process.env[m[1].trim()] = val;
    }
  });
}

import { analyseRepo, generateLessonPlan } from "./githuburl";
import type { TargetRole } from "./githuburl";

const REPO_URL = "https://github.com/Rida-ds-hub/Style_Hub_IE_Project";
const TARGET_ROLE: TargetRole = "ML_ENGINEER";

async function main() {
  console.log("Step 1: Analysing repo:", REPO_URL);
  const analysis = await analyseRepo(REPO_URL);
  console.log("  Repo type:", analysis.meta.repoType);
  console.log("  Patterns:", analysis.patterns.map((p) => p.pattern).join(", "));

  console.log("\nStep 2: Generating lesson plan (target role:", TARGET_ROLE, ")...");
  const plan = await generateLessonPlan(analysis, TARGET_ROLE);

  console.log("\n" + "=".repeat(60));
  console.log("LESSON PLAN");
  console.log("=".repeat(60));
  console.log(JSON.stringify(plan, null, 2));
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
