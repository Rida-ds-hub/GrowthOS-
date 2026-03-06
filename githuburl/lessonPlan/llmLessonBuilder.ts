/**
 * LLM-backed lesson and design-decision building. Uses GEMINI_API_KEY and @google/generative-ai.
 * Three sequential calls: design decisions, lesson stubs, test questions.
 */

import type { AnalyseRepoResult } from "../index";
import type {
  DesignDecision,
  EvaluationMethod,
  EvaluationRubric,
  Lesson,
  LessonStubRaw,
  OrderedConcept,
  QuestionType,
  ResponseFormat,
  TargetRole,
  TestQuestion,
} from "./types";
import { buildPromptPayload } from "./promptPayloadBuilder";

const LLM_TIMEOUT_MS = 30_000;

function logTokenEstimate(stage: string, input: string, output: string): void {
  const inputTokens = Math.round(input.length / 4);
  const outputTokens = Math.round(output.length / 4);
  console.log(
    `[LessonPlan] ${stage} — input ~${inputTokens} tokens, output ~${outputTokens} tokens`
  );
}

export class LessonPlanGenerationError extends Error {
  constructor(
    message: string,
    public readonly stage: "DESIGN_DECISIONS" | "LESSON_STUBS" | "TEST_QUESTIONS"
  ) {
    super(message);
    this.name = "LessonPlanGenerationError";
  }
}

export type GenerateContentFn = (prompt: string) => Promise<string>;

function validateLessonStub(stub: LessonStubRaw, index: number): void {
  const wordCount = (s: string) => s.trim().split(/\s+/).length;

  if (!stub.hook || wordCount(stub.hook) > 25) {
    console.warn(`Lesson ${index}: hook missing or too long (${wordCount(stub.hook ?? "")} words)`);
  }
  if (!stub.context || stub.context.split(".").filter(Boolean).length > 4) {
    console.warn(`Lesson ${index}: context missing or exceeds 3 sentences`);
  }
  if (!stub.coreInsight) {
    console.warn(`Lesson ${index}: coreInsight missing`);
  }
  if (!stub.tradeoff || !stub.tradeoff.toLowerCase().includes("but")) {
    console.warn(`Lesson ${index}: tradeoff missing or does not follow X enables Y but costs Z format`);
  }
  if (!stub.roleRelevanceNote) {
    console.warn(`Lesson ${index}: roleRelevanceNote missing`);
  }
}

const FORMAT_MAP: Record<QuestionType, ResponseFormat> = {
  DEFEND_DECISION: "FREE_TEXT",
  IDENTIFY_TRADEOFF: "RANKED_CHOICE",
  PROPOSE_ALTERNATIVE: "FREE_TEXT",
  DIAGNOSE_PROBLEM: "MULTI_SELECT",
};
const EVAL_MAP: Record<QuestionType, EvaluationMethod> = {
  DEFEND_DECISION: "LLM_REQUIRED",
  IDENTIFY_TRADEOFF: "HYBRID",
  PROPOSE_ALTERNATIVE: "LLM_REQUIRED",
  DIAGNOSE_PROBLEM: "DETERMINISTIC",
};

function validateAndNormaliseQuestion(q: TestQuestion, lessonIndex: number): TestQuestion {
  const correctedFormat = FORMAT_MAP[q.type] ?? q.responseFormat;
  const correctedMethod = EVAL_MAP[q.type] ?? q.evaluationMethod;

  if (correctedFormat !== q.responseFormat) {
    console.warn(
      `Lesson ${lessonIndex} question ${q.id}: responseFormat corrected from ${q.responseFormat} to ${correctedFormat}`
    );
  }

  const correctedOptions =
    correctedFormat === "FREE_TEXT" ? null : (q.options ?? null);

  const correctedRubric: EvaluationRubric = {
    reasoningGuidance: q.rubric?.reasoningGuidance ?? null,
    correctOptionIds: q.rubric?.correctOptionIds ?? null,
    correctRankOrder: q.rubric?.correctRankOrder ?? null,
    keyLearning: q.rubric?.keyLearning ?? "",
  };

  return {
    ...q,
    responseFormat: correctedFormat,
    evaluationMethod: correctedMethod,
    options: correctedOptions,
    rubric: correctedRubric,
  };
}

function enforceFreeTextCap(questions: TestQuestion[]): TestQuestion[] {
  const freeTextQuestions = questions.filter((q) => q.responseFormat === "FREE_TEXT");
  if (freeTextQuestions.length <= 1) return questions;

  let freeTextKept = false;
  return questions.filter((q) => {
    if (q.responseFormat === "FREE_TEXT") {
      if (!freeTextKept) {
        freeTextKept = true;
        return true;
      }
      console.warn(`Dropping extra FREE_TEXT question ${q.id} — max 1 per lesson`);
      return false;
    }
    return true;
  });
}

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

function getDefaultGenerateContent(): GenerateContentFn {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "placeholder-key") {
    throw new LessonPlanGenerationError(
      "GEMINI_API_KEY is required for lesson plan generation. Add it to .env.local.",
      "DESIGN_DECISIONS"
    );
  }
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  return async (prompt: string): Promise<string> => {
    const result = await model.generateContent(prompt);
    return result.response.text() || "[]";
  };
}

export async function buildLessonsWithLLM(
  analysis: AnalyseRepoResult,
  targetRole: TargetRole,
  orderedConcepts: OrderedConcept[],
  options?: { generateContent?: GenerateContentFn }
): Promise<{ designDecisions: DesignDecision[]; lessons: Lesson[] }> {
  const generateContent = options?.generateContent ?? getDefaultGenerateContent();
  const payload = buildPromptPayload(analysis, orderedConcepts);

  let designDecisions: DesignDecision[] = [];
  try {
    const prompt1 = `You are an expert software architect and technical educator. Your job is to identify the most significant design decisions in a codebase and explain them in a way that teaches architectural thinking. Focus on WHY decisions were made, not WHAT the code does. Respond only in valid JSON — no markdown, no preamble.

Given this repository analysis, identify the 3-5 most significant design decisions made in this codebase.

For each decision return:
- id (slug)
- title (short label)
- problem (what problem this decision was solving)
- solution (what was decided and implemented)
- tradeoff (what was sacrificed or accepted to make this choice)
- alternativesConsidered (array of 2-3 alternatives that could have been chosen)

Repository analysis:
- Name: ${payload.repoMeta.repoName}
- Type: ${payload.repoMeta.repoType}
- Primary language: ${payload.repoMeta.primaryLanguage}
- Complexity: ${payload.repoMeta.complexityScore}/10
- Patterns detected: ${JSON.stringify(payload.topPatterns)}
- Critical files: ${JSON.stringify(payload.topCriticalNodes)}
- Architecture docs:\n${payload.docSummary}
- Frameworks: ${JSON.stringify(payload.repoMeta.frameworks)}

OUTPUT LENGTH RULES — strictly enforced:
- id: slug format, max 6 words hyphenated, no spaces
- title: max 8 words
- problem: max 2 sentences
- solution: max 2 sentences
- tradeoff: max 1 sentence, must name what was sacrificed
- alternativesConsidered: exactly 2 items, each max 6 words

Return JSON array of DesignDecision objects only.`;

    const raw1 = await timeout(generateContent(prompt1), LLM_TIMEOUT_MS);
    logTokenEstimate("DESIGN_DECISIONS", prompt1, raw1);
    const cleaned1 = raw1.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    designDecisions = JSON.parse(cleaned1) as DesignDecision[];
    if (!Array.isArray(designDecisions)) designDecisions = [];
  } catch (e) {
    throw new LessonPlanGenerationError(
      e instanceof Error ? e.message : "Design decisions call failed",
      "DESIGN_DECISIONS"
    );
  }

  let lessonStubs: LessonStubRaw[] = [];
  try {
    const prompt2 = `You are an expert microlearning designer for technical professionals.
You build lessons that teach architectural thinking in exactly 15 minutes.
Your lessons follow a strict structure: hook → context → insight → tradeoff.
Every field has a hard length limit. Exceeding it means the lesson is too long.
A learner reads your lesson BEFORE seeing any code — they must be able to
defend the design decision without having seen the implementation.
Respond only in valid JSON — no markdown, no preamble.

Generate one lesson stub per concept below. Each stub teaches the architectural
thinking behind one design decision in this repository.

STRICT FIELD RULES — violating these makes the lesson unusable:
- hook: one sentence, max 20 words, must create curiosity or tension
  Example: "Your model hits 94% training accuracy but falls apart in production — what went wrong?"
- context: max 3 sentences, no code, no syntax — only concepts and decisions
  Example: "Random Forest is an ensemble method that builds many independent decision trees.
  Each tree sees a random subset of features, which prevents any single tree from memorising
  the training data. The final prediction is a vote across all trees."
- coreInsight: max 2 sentences, must be a transferable principle not a repo-specific fact
  Example: "Distributing decisions across independent learners trades interpretability for
  robustness — the same principle applies in microservices, consensus protocols, and load balancing."
- tradeoff: exactly 1 sentence, must follow format: "[choice] enables [benefit] but costs [sacrifice]"
  Example: "Using 100 trees enables variance reduction but costs inference speed and model explainability."
- roleRelevanceNote: exactly 1 sentence, must name the target role explicitly
  Example: "For an ML Engineer, understanding this tradeoff determines whether you can defend
  your model choice in a production design review."
- designDecisionRef: must be one of the provided decision ids, or null

OUTPUT LENGTH RULES — strictly enforced:
- title: max 10 words
- coreQuestion: max 15 words, must end with a question mark
- hook: max 20 words, must create tension or curiosity
- context: max 3 sentences, no code, no syntax
- coreInsight: max 2 sentences, must be a transferable principle
- tradeoff: exactly 1 sentence, format: "[choice] enables [benefit] but costs [sacrifice]"
- roleRelevanceNote: exactly 1 sentence, must name the target role
- designDecisionRef: must be one of the provided decision ids, or null
Do NOT add any fields not listed above.
Do NOT include explanations, notes, or commentary outside the JSON.

Target role: ${targetRole}
Design decisions available for reference (id + title only):
${JSON.stringify(designDecisions.map((d) => ({ id: d.id, title: d.title })))}
Ordered concepts: ${JSON.stringify(payload.conceptsPayload)}

Return a JSON array of LessonStubRaw objects, one per concept, in the same order.
Array length must equal ${orderedConcepts.length}.`;

    const raw2 = await timeout(generateContent(prompt2), LLM_TIMEOUT_MS);
    logTokenEstimate("LESSON_STUBS", prompt2, raw2);
    const cleaned2 = raw2.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    lessonStubs = JSON.parse(cleaned2) as LessonStubRaw[];
    if (!Array.isArray(lessonStubs)) lessonStubs = [];
    lessonStubs.forEach((stub, i) => validateLessonStub(stub, i));
  } catch (e) {
    throw new LessonPlanGenerationError(
      e instanceof Error ? e.message : "Lesson stubs call failed",
      "LESSON_STUBS"
    );
  }

  const lessons: Lesson[] = orderedConcepts.slice(0, lessonStubs.length).map((concept, i) => {
    const stub = lessonStubs[i] ?? {
      title: concept.title,
      coreQuestion: "What does this concept teach?",
      hook: "",
      context: "",
      coreInsight: "",
      tradeoff: "",
      roleRelevanceNote: "",
      designDecisionRef: null,
      codeRevealAfterTest: true,
    };
    const codeRevealAfterTest = concept.conceptType !== "IMPLEMENTATION_DETAIL";
    return {
      dayNumber: concept.dayNumber,
      title: stub.title,
      coreQuestion: stub.coreQuestion,
      concept: concept.id,
      conceptType: concept.conceptType,
      hook: stub.hook ?? "",
      context: stub.context ?? "",
      coreInsight: stub.coreInsight ?? "",
      tradeoff: stub.tradeoff ?? "",
      roleRelevanceNote: stub.roleRelevanceNote ?? "",
      fileAnchors: concept.fileAnchors,
      testQuestions: [],
      codeRevealAfterTest,
      estimatedMinutes: concept.estimatedMinutes,
      designDecisionRef: stub.designDecisionRef ?? undefined,
    };
  });

  try {
    const prompt3 = `You are an expert assessment designer for technical microlearning.
You generate test questions that evaluate architectural reasoning, not recall.
For each lesson you generate exactly 2-3 questions following strict type rules.

QUESTION TYPE RULES — these are non-negotiable:
- DEFEND_DECISION: learner writes 2-3 sentences defending a specific design choice.
  Use for the most important decision in each lesson.
  Provide reasoningGuidance explaining what good reasoning looks like.
  Set options to null. Set correctOptionIds and correctRankOrder to null.

- IDENTIFY_TRADEOFF: learner is shown 4 options and must drag-rank the top 2
  tradeoffs in order of significance, then give a one-line reason.
  Provide 4 options (2 correct tradeoffs, 2 plausible distractors).
  Set correctRankOrder to the correct order of the 2 correct option ids.
  Provide reasoningGuidance for evaluating the written reason.

- PROPOSE_ALTERNATIVE: learner writes 2-3 sentences proposing a different
  architectural approach and justifying it.
  Use sparingly — maximum 1 per lesson plan total across all lessons.
  Provide reasoningGuidance. Set options to null.

- DIAGNOSE_PROBLEM: learner selects all correct answers from 4 options.
  Use when the lesson involves a POOR or CRITIQUE mode repo, or when the
  concept involves identifying a flaw or missing pattern.
  Provide 4 options with isCorrect and explanation on each.
  Set correctOptionIds to the ids of all correct options.

DISTRIBUTION RULE: Each lesson must have at most 1 FREE_TEXT question
(DEFEND_DECISION or PROPOSE_ALTERNATIVE). The remaining questions must be
RANKED_CHOICE or MULTI_SELECT. This minimises evaluation cost.

RUBRIC RULES:
- keyLearning must be one sentence stating the transferable principle
- reasoningGuidance must describe what a passing answer demonstrates,
  not what a perfect answer says — focus on reasoning quality signals
- All option explanations must explain the underlying concept, not just
  say "this is wrong"

OUTPUT LENGTH RULES — strictly enforced:
- question: max 25 words
- options[].text: max 12 words each
- options[].explanation: max 2 sentences each
- rubric.reasoningGuidance: max 3 sentences, describe signals of good reasoning
- rubric.keyLearning: exactly 1 sentence, a transferable principle
- correctRankOrder: exactly 2 option ids for IDENTIFY_TRADEOFF questions
- correctOptionIds: between 1 and 3 ids for DIAGNOSE_PROBLEM questions
Do NOT generate more than 3 questions per lesson.
Do NOT add fields not listed in the type definition.

Respond only in valid JSON — no markdown, no preamble.

Generate 2-3 test questions for each lesson below.
A learner answers these BEFORE seeing the code.
Questions must connect directly to the hook and tradeoff in each lesson.

Target role: ${targetRole}
Lessons: ${JSON.stringify(
      lessons.map((l, i) => ({
        index: i,
        title: l.title,
        hook: l.hook,
        coreInsight: l.coreInsight,
        tradeoff: l.tradeoff,
        designDecisionRef: l.designDecisionRef ?? null,
        conceptType: l.conceptType,
      }))
    )}
Design decisions: ${JSON.stringify(
      designDecisions.map((d) => ({
        id: d.id,
        title: d.title,
        tradeoff: d.tradeoff,
        alternativesConsidered: d.alternativesConsidered,
      }))
    )}

Return a JSON object keyed by lesson index (0-based):
{ "0": [TestQuestion, ...], "1": [TestQuestion, ...], ... }

Each TestQuestion must include all fields:
id, question, type, responseFormat, evaluationMethod, options, rubric.
rubric must include: reasoningGuidance, correctOptionIds, correctRankOrder, keyLearning.`;

    const raw3 = await timeout(generateContent(prompt3), LLM_TIMEOUT_MS);
    logTokenEstimate("TEST_QUESTIONS", prompt3, raw3);
    const cleaned3 = raw3.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questionsByIndex = JSON.parse(cleaned3) as Record<string, TestQuestion[]>;
    if (questionsByIndex && typeof questionsByIndex === "object") {
      for (let i = 0; i < lessons.length; i++) {
        const qs = questionsByIndex[String(i)] ?? questionsByIndex[i];
        if (Array.isArray(qs)) {
          const normalised = qs.map((q) => validateAndNormaliseQuestion(q, i));
          lessons[i].testQuestions = enforceFreeTextCap(normalised);
        }
      }
    }
  } catch (e) {
    throw new LessonPlanGenerationError(
      e instanceof Error ? e.message : "Test questions call failed",
      "TEST_QUESTIONS"
    );
  }

  return { designDecisions, lessons };
}
