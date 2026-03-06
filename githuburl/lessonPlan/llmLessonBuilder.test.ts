/**
 * Tests for llmLessonBuilder. Mocks LLM client. Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' llmLessonBuilder.test.ts
 */

import type { AnalyseRepoResult } from "../index";
import type { OrderedConcept } from "./types";
import {
  buildLessonsWithLLM,
  LessonPlanGenerationError,
  type GenerateContentFn,
} from "./llmLessonBuilder";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const mockAnalysis: AnalyseRepoResult = {
  meta: {
    repoName: "test/repo",
    repoUrl: "https://github.com/test/repo",
    description: null,
    primaryLanguage: "Python",
    repoType: "PYTHON_PROJECT",
    frameworks: [],
    entryPoints: [],
  },
  fileMap: { total: 2, classified: [] },
  dependencyGraph: { nodes: [], edges: [] },
  notebookAnalysis: null,
  patterns: [],
  complexity: {
    fileCount: 2,
    maxDepth: 0,
    avgDependencies: 0,
    criticalNodes: [],
    complexityScore: 2,
    estimatedLessons: 3,
  },
  rawFileTree: [],
  docs: [],
};

const mockOrderedConcepts: OrderedConcept[] = [
  {
    id: "concept-1",
    title: "Concept 1",
    source: "PATTERN",
    signal: "",
    relevanceScore: 0.8,
    roleRelevance: {},
    fileAnchors: ["src/main.py"],
    conceptType: "ARCHITECTURAL_PATTERN",
    dayNumber: 1,
    estimatedMinutes: 15,
  },
  {
    id: "concept-2",
    title: "Concept 2",
    source: "CRITICAL_NODE",
    signal: "",
    relevanceScore: 0.7,
    roleRelevance: {},
    fileAnchors: ["src/model.py"],
    conceptType: "DESIGN_DECISION",
    dayNumber: 2,
    estimatedMinutes: 15,
  },
];

async function runTests(): Promise<void> {
  const callOrder: string[] = [];
  const validDesignDecisions = [
    { id: "dd-1", title: "Decision 1", problem: "P", solution: "S", tradeoff: "T", alternativesConsidered: ["A1"] },
  ];
  const validStubs = [
    {
      title: "Lesson 1",
      coreQuestion: "Q1?",
      hook: "Why does this pattern matter in production?",
      context: "This repo uses a layered architecture.",
      coreInsight: "Separation of concerns enables scaling but costs indirection.",
      tradeoff: "Layers enable clear boundaries but cost extra hops.",
      roleRelevanceNote: "For a Software Engineer, this shapes how you defend design choices.",
      designDecisionRef: "dd-1",
      codeRevealAfterTest: true,
    },
    {
      title: "Lesson 2",
      coreQuestion: "Q2?",
      hook: "What tradeoff did the team accept here?",
      context: "The model was chosen for interpretability.",
      coreInsight: "Interpretability enables debugging but costs flexibility.",
      tradeoff: "Using a linear model enables explainability but costs predictive power.",
      roleRelevanceNote: "For a Software Engineer, this matters in design reviews.",
      designDecisionRef: null,
      codeRevealAfterTest: true,
    },
  ];
  const validQuestions: Record<string, unknown> = {
    "0": [
      {
        id: "q1",
        question: "Why was this design chosen?",
        type: "DEFEND_DECISION",
        responseFormat: "FREE_TEXT",
        evaluationMethod: "LLM_REQUIRED",
        options: null,
        rubric: {
          reasoningGuidance: "Good reasoning explains the tradeoff.",
          correctOptionIds: null,
          correctRankOrder: null,
          keyLearning: "Design choices reflect tradeoffs.",
        },
      },
    ],
    "1": [
      {
        id: "q2",
        question: "Rank the top 2 tradeoffs.",
        type: "IDENTIFY_TRADEOFF",
        responseFormat: "RANKED_CHOICE",
        evaluationMethod: "HYBRID",
        options: [
          { id: "opt-a", text: "Tradeoff A", isCorrect: true, explanation: "Correct." },
          { id: "opt-b", text: "Tradeoff B", isCorrect: true, explanation: "Correct." },
          { id: "opt-c", text: "Distractor C", isCorrect: false, explanation: "Wrong." },
          { id: "opt-d", text: "Distractor D", isCorrect: false, explanation: "Wrong." },
        ],
        rubric: {
          reasoningGuidance: "Evaluate the written reason.",
          correctOptionIds: null,
          correctRankOrder: ["opt-a", "opt-b"],
          keyLearning: "Tradeoffs can be ranked by impact.",
        },
      },
    ],
  };

  let happyCallCount = 0;
  const happyPathGenerate: GenerateContentFn = async () => {
    happyCallCount++;
    if (happyCallCount === 1) {
      callOrder.push("DESIGN_DECISIONS");
      return JSON.stringify(validDesignDecisions);
    }
    if (happyCallCount === 2) {
      callOrder.push("LESSON_STUBS");
      return JSON.stringify(validStubs);
    }
    callOrder.push("TEST_QUESTIONS");
    return JSON.stringify(validQuestions);
  };

  const result = await buildLessonsWithLLM(
    mockAnalysis,
    "SOFTWARE_ENGINEER",
    mockOrderedConcepts,
    { generateContent: happyPathGenerate }
  );

  assert(callOrder[0] === "DESIGN_DECISIONS", "First call should be DESIGN_DECISIONS");
  assert(callOrder[1] === "LESSON_STUBS", "Second call should be LESSON_STUBS");
  assert(callOrder[2] === "TEST_QUESTIONS", "Third call should be TEST_QUESTIONS");
  assert(Array.isArray(result.designDecisions), "Should return designDecisions array");
  assert(Array.isArray(result.lessons), "Should return lessons array");
  assert(result.lessons.length >= 1, "Should have at least one lesson");
  assert(
    result.lessons[0].testQuestions.length >= 1,
    "First lesson should have test questions from stub"
  );
  assert(result.lessons[0].hook.length > 0, "Lesson should have non-empty hook");
  assert(result.lessons[0].context.length > 0, "Lesson should have non-empty context");
  assert(result.lessons[0].coreInsight.length > 0, "Lesson should have non-empty coreInsight");
  assert(result.lessons[0].tradeoff.includes("but"), "Lesson tradeoff should contain 'but'");
  assert(result.lessons[0].roleRelevanceNote.length > 0, "Lesson should have non-empty roleRelevanceNote");
  const q0 = result.lessons[0].testQuestions[0];
  assert(q0 != null, "First lesson should have at least one test question");
  assert("responseFormat" in q0 && q0.responseFormat !== undefined, "TestQuestion should have responseFormat");
  assert("evaluationMethod" in q0 && q0.evaluationMethod !== undefined, "TestQuestion should have evaluationMethod");
  assert("options" in q0, "TestQuestion should have options");
  assert("rubric" in q0 && q0.rubric != null, "TestQuestion should have rubric");
  assert("keyLearning" in q0.rubric && typeof q0.rubric.keyLearning === "string", "rubric should have keyLearning");

  let thrown = false;
  try {
    await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
      generateContent: async () => {
        throw new Error("API error");
      },
    });
  } catch (e) {
    thrown = true;
    assert(e instanceof LessonPlanGenerationError, "Should throw LessonPlanGenerationError");
    assert((e as LessonPlanGenerationError).stage === "DESIGN_DECISIONS", "Stage should be DESIGN_DECISIONS");
  }
  assert(thrown, "Should throw on generateContent failure");

  let thrownStage2 = false;
  let callCount = 0;
  await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async () => {
      callCount++;
      if (callCount === 1) return JSON.stringify(validDesignDecisions);
      if (callCount === 2) throw new Error("Stage 2 fail");
      return JSON.stringify(validQuestions);
    },
  }).catch((e) => {
    thrownStage2 = true;
    assert(e instanceof LessonPlanGenerationError, "Should throw LessonPlanGenerationError on stage 2");
    assert((e as LessonPlanGenerationError).stage === "LESSON_STUBS", "Stage should be LESSON_STUBS");
  });
  assert(thrownStage2, "Should throw on second call failure");

  // Test — graceful fallback on malformed stub
  let warnCalls = 0;
  const originalWarn = console.warn;
  console.warn = () => {
    warnCalls++;
  };
  const malformedStubs = [
    {
      title: "Good",
      coreQuestion: "Q?",
      hook: "A good hook.",
      context: "One. Two. Three.",
      coreInsight: "Insight.",
      tradeoff: "X enables Y but costs Z.",
      roleRelevanceNote: "For engineers.",
      designDecisionRef: null,
      codeRevealAfterTest: true,
    },
    {
      title: "Bad",
      coreQuestion: "Q?",
      hook: "",
      context: "Only context.",
      coreInsight: "",
      tradeoff: "",
      roleRelevanceNote: "Note.",
      designDecisionRef: null,
      codeRevealAfterTest: true,
    },
  ];
  const fallbackResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(malformedStubs);
      return JSON.stringify(validQuestions);
    },
  });
  console.warn = originalWarn;
  assert(fallbackResult.lessons.length >= 2, "Should have at least 2 lessons");
  assert(fallbackResult.lessons[0].hook === "A good hook.", "Well-formed stub should have hook");
  assert(fallbackResult.lessons[0].coreInsight === "Insight.", "Well-formed stub should have coreInsight");
  assert(fallbackResult.lessons[0].tradeoff.includes("but"), "Well-formed stub should have tradeoff with but");
  assert(fallbackResult.lessons[1].hook === "", "Malformed stub should get empty hook default");
  assert(fallbackResult.lessons[1].coreInsight === "", "Malformed stub should get empty coreInsight default");
  assert(fallbackResult.lessons[1].tradeoff === "", "Malformed stub should get empty tradeoff default");
  assert(warnCalls >= 1, "validateLessonStub should have logged warnings for malformed stub");

  // Test — array length mismatch (fewer stubs than concepts)
  const fiveConcepts: OrderedConcept[] = [
    ...mockOrderedConcepts,
    {
      id: "c3",
      title: "C3",
      source: "PATTERN",
      signal: "",
      relevanceScore: 0.5,
      roleRelevance: {},
      fileAnchors: ["x.py"],
      conceptType: "DESIGN_DECISION",
      dayNumber: 3,
      estimatedMinutes: 15,
    },
    {
      id: "c4",
      title: "C4",
      source: "PATTERN",
      signal: "",
      relevanceScore: 0.4,
      roleRelevance: {},
      fileAnchors: ["y.py"],
      conceptType: "DESIGN_DECISION",
      dayNumber: 4,
      estimatedMinutes: 15,
    },
    {
      id: "c5",
      title: "C5",
      source: "PATTERN",
      signal: "",
      relevanceScore: 0.3,
      roleRelevance: {},
      fileAnchors: ["z.py"],
      conceptType: "DESIGN_DECISION",
      dayNumber: 5,
      estimatedMinutes: 15,
    },
  ];
  const threeStubsOnly = [
    validStubs[0],
    validStubs[1],
    {
      title: "Lesson 3",
      coreQuestion: "Q3?",
      hook: "Third hook.",
      context: "Context.",
      coreInsight: "Insight.",
      tradeoff: "A enables B but costs C.",
      roleRelevanceNote: "For engineers.",
      designDecisionRef: null,
      codeRevealAfterTest: true,
    },
  ];
  const mismatchResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", fiveConcepts, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(threeStubsOnly);
      return JSON.stringify(validQuestions);
    },
  });
  assert(mismatchResult.lessons.length === 3, "lessons.length should equal stubs returned (3), not concept count (5)");
  assert(mismatchResult.lessons[0].title === "Lesson 1", "First lesson should have full stub data");
  assert(mismatchResult.lessons[2].title === "Lesson 3", "Third lesson should have stub data");

  // Test — type→format mapping is enforced
  let formatWarnCalls = 0;
  const origWarn2 = console.warn;
  console.warn = () => {
    formatWarnCalls++;
  };
  const wrongFormatQuestions: Record<string, unknown> = {
    "0": [
      {
        id: "wrong-1",
        question: "Defend this.",
        type: "DEFEND_DECISION",
        responseFormat: "MULTI_SELECT",
        evaluationMethod: "DETERMINISTIC",
        options: [{ id: "a", text: "A", isCorrect: true, explanation: "x" }],
        rubric: { reasoningGuidance: "Good.", correctOptionIds: ["a"], correctRankOrder: null, keyLearning: "L." },
      },
    ],
    "1": [
      {
        id: "wrong-2",
        question: "What is wrong?",
        type: "DIAGNOSE_PROBLEM",
        responseFormat: "FREE_TEXT",
        evaluationMethod: "LLM_REQUIRED",
        options: null,
        rubric: { reasoningGuidance: "Good.", correctOptionIds: null, correctRankOrder: null, keyLearning: "L." },
      },
    ],
  };
  const formatResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(validStubs);
      return JSON.stringify(wrongFormatQuestions);
    },
  });
  console.warn = origWarn2;
  assert(formatResult.lessons[0].testQuestions[0].responseFormat === "FREE_TEXT", "DEFEND_DECISION corrected to FREE_TEXT");
  assert(formatResult.lessons[1].testQuestions[0].responseFormat === "MULTI_SELECT", "DIAGNOSE_PROBLEM corrected to MULTI_SELECT");
  assert(formatResult.lessons[0].testQuestions[0].options === null, "FREE_TEXT should have null options");
  assert(formatWarnCalls >= 1, "validateAndNormaliseQuestion should have logged format correction");

  // Test — free-text cap enforcement
  let freeTextWarnCalls = 0;
  console.warn = () => {
    freeTextWarnCalls++;
  };
  const threeFreeText = [
    {
      id: "ft1",
      question: "Defend.",
      type: "DEFEND_DECISION",
      responseFormat: "FREE_TEXT",
      evaluationMethod: "LLM_REQUIRED",
      options: null,
      rubric: { reasoningGuidance: "R.", correctOptionIds: null, correctRankOrder: null, keyLearning: "K." },
    },
    {
      id: "ft2",
      question: "Propose.",
      type: "PROPOSE_ALTERNATIVE",
      responseFormat: "FREE_TEXT",
      evaluationMethod: "LLM_REQUIRED",
      options: null,
      rubric: { reasoningGuidance: "R.", correctOptionIds: null, correctRankOrder: null, keyLearning: "K." },
    },
    {
      id: "ft3",
      question: "Also defend.",
      type: "DEFEND_DECISION",
      responseFormat: "FREE_TEXT",
      evaluationMethod: "LLM_REQUIRED",
      options: null,
      rubric: { reasoningGuidance: "R.", correctOptionIds: null, correctRankOrder: null, keyLearning: "K." },
    },
  ];
  const freeTextCapResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(validStubs);
      return JSON.stringify({ "0": threeFreeText, "1": [] });
    },
  });
  console.warn = origWarn2;
  assert(freeTextCapResult.lessons[0].testQuestions.length === 1, "Only 1 FREE_TEXT question should remain");
  assert(freeTextWarnCalls >= 2, "enforceFreeTextCap should have logged twice for 2 dropped questions");

  // Test — DIAGNOSE_PROBLEM question shape
  const diagnoseQuestion = {
    id: "diag-1",
    question: "What is wrong with this design?",
    type: "DIAGNOSE_PROBLEM",
    responseFormat: "MULTI_SELECT",
    evaluationMethod: "DETERMINISTIC",
    options: [
      { id: "d1", text: "Missing validation", isCorrect: true, explanation: "Correct." },
      { id: "d2", text: "Tight coupling", isCorrect: true, explanation: "Correct." },
      { id: "d3", text: "Good separation", isCorrect: false, explanation: "Wrong." },
      { id: "d4", text: "Clear API", isCorrect: false, explanation: "Wrong." },
    ],
    rubric: {
      reasoningGuidance: null,
      correctOptionIds: ["d1", "d2"],
      correctRankOrder: null,
      keyLearning: "Flaws can be identified from structure.",
    },
  };
  const diagResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(validStubs);
      return JSON.stringify({ "0": [diagnoseQuestion], "1": [] });
    },
  });
  const dq = diagResult.lessons[0].testQuestions[0];
  assert(dq.options != null && dq.options.length === 4, "DIAGNOSE_PROBLEM should have 4 options");
  assert(dq.rubric.correctOptionIds != null && dq.rubric.correctOptionIds.length === 2, "correctOptionIds should have 2 ids");
  assert(dq.rubric.reasoningGuidance === null, "DETERMINISTIC question rubric.reasoningGuidance should be null");
  assert(dq.evaluationMethod === "DETERMINISTIC", "DIAGNOSE_PROBLEM should be DETERMINISTIC");

  // Test — IDENTIFY_TRADEOFF question shape
  const rankQuestion = {
    id: "rank-1",
    question: "Rank the top 2 tradeoffs.",
    type: "IDENTIFY_TRADEOFF",
    responseFormat: "RANKED_CHOICE",
    evaluationMethod: "HYBRID",
    options: [
      { id: "r1", text: "Perf vs clarity", isCorrect: true, explanation: "Top." },
      { id: "r2", text: "Speed vs safety", isCorrect: true, explanation: "Second." },
      { id: "r3", text: "Distractor", isCorrect: false, explanation: "No." },
      { id: "r4", text: "Distractor", isCorrect: false, explanation: "No." },
    ],
    rubric: {
      reasoningGuidance: "Good reason explains order.",
      correctOptionIds: null,
      correctRankOrder: ["r1", "r2"],
      keyLearning: "Tradeoffs can be ranked.",
    },
  };
  const rankResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(validStubs);
      return JSON.stringify({ "0": [rankQuestion], "1": [] });
    },
  });
  const rq = rankResult.lessons[0].testQuestions[0];
  assert(rq.options != null && rq.options.length === 4, "IDENTIFY_TRADEOFF should have 4 options");
  assert(rq.rubric.correctRankOrder != null && rq.rubric.correctRankOrder.length === 2, "correctRankOrder should have 2 ids");
  assert(rq.rubric.reasoningGuidance != null && rq.rubric.reasoningGuidance.length > 0, "HYBRID should have reasoningGuidance");
  assert(rq.evaluationMethod === "HYBRID", "IDENTIFY_TRADEOFF should be HYBRID");

  // Test — rubric keyLearning always present
  const noKeyLearningQuestions = {
    "0": [
      {
        id: "nkl-1",
        question: "Defend.",
        type: "DEFEND_DECISION",
        responseFormat: "FREE_TEXT",
        evaluationMethod: "LLM_REQUIRED",
        options: null,
        rubric: { reasoningGuidance: "R.", correctOptionIds: null, correctRankOrder: null },
      },
    ],
    "1": [],
  };
  const nklResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(validStubs);
      return JSON.stringify(noKeyLearningQuestions);
    },
  });
  assert(nklResult.lessons[0].testQuestions.length === 1, "Should have one question");
  assert("keyLearning" in nklResult.lessons[0].testQuestions[0].rubric, "rubric should have keyLearning key");
  assert(nklResult.lessons[0].testQuestions[0].rubric.keyLearning === "", "keyLearning should default to empty string");

  // Test — codeRevealAfterTest is computed deterministically
  const conceptsForReveal: OrderedConcept[] = [
    {
      id: "impl-detail",
      title: "Implementation detail",
      source: "PATTERN",
      signal: "",
      relevanceScore: 0.8,
      roleRelevance: {},
      fileAnchors: ["x.py"],
      conceptType: "IMPLEMENTATION_DETAIL",
      dayNumber: 1,
      estimatedMinutes: 15,
    },
    {
      id: "arch-pattern",
      title: "Arch pattern",
      source: "PATTERN",
      signal: "",
      relevanceScore: 0.7,
      roleRelevance: {},
      fileAnchors: ["y.py"],
      conceptType: "ARCHITECTURAL_PATTERN",
      dayNumber: 2,
      estimatedMinutes: 15,
    },
  ];
  const stubsIgnoreReveal = [
    { ...validStubs[0], codeRevealAfterTest: false },
    { ...validStubs[1], codeRevealAfterTest: false },
  ];
  const revealResult = await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", conceptsForReveal, {
    generateContent: async (prompt) => {
      if (prompt.includes("design decisions")) return JSON.stringify(validDesignDecisions);
      if (prompt.includes("lesson stub") || prompt.includes("LessonStubRaw")) return JSON.stringify(stubsIgnoreReveal);
      return JSON.stringify(validQuestions);
    },
  });
  assert(revealResult.lessons[0].codeRevealAfterTest === false, "IMPLEMENTATION_DETAIL lesson must have codeRevealAfterTest false");
  assert(revealResult.lessons[1].codeRevealAfterTest === true, "ARCHITECTURAL_PATTERN lesson must have codeRevealAfterTest true");

  // Test — token logging is called three times
  const logCalls: string[] = [];
  const origLog = console.log;
  console.log = (...args: unknown[]) => {
    logCalls.push(String(args[0]));
  };
  let tokenTestCallNum = 0;
  await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async () => {
      tokenTestCallNum++;
      if (tokenTestCallNum === 1) return JSON.stringify(validDesignDecisions);
      if (tokenTestCallNum === 2) return JSON.stringify(validStubs);
      return JSON.stringify(validQuestions);
    },
  });
  console.log = origLog;
  const withDesign = logCalls.filter((s) => s.includes("DESIGN_DECISIONS") && s.includes("tokens"));
  const withStubs = logCalls.filter((s) => s.includes("LESSON_STUBS") && s.includes("tokens"));
  const withTestQ = logCalls.filter((s) => s.includes("TEST_QUESTIONS") && s.includes("tokens"));
  assert(withDesign.length >= 1, "console.log should be called with DESIGN_DECISIONS and tokens");
  assert(withStubs.length >= 1, "console.log should be called with LESSON_STUBS and tokens");
  assert(withTestQ.length >= 1, "console.log should be called with TEST_QUESTIONS and tokens");

  // Test — Call 2 does not receive full design decision objects
  let call2Prompt = "";
  let callCount2 = 0;
  await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      callCount2++;
      if (callCount2 === 2) call2Prompt = prompt;
      if (callCount2 === 1) return JSON.stringify(validDesignDecisions);
      if (callCount2 === 2) return JSON.stringify(validStubs);
      return JSON.stringify(validQuestions);
    },
  });
  assert(call2Prompt.includes("id") && call2Prompt.includes("title"), "Call 2 prompt should contain id and title for design decisions");
  assert(!call2Prompt.includes("alternativesConsidered"), "Call 2 prompt should not contain alternativesConsidered");
  assert(!call2Prompt.includes('"problem"'), "Call 2 prompt should not contain problem field");

  // Test — Call 3 receives slimmed lesson objects
  let call3Prompt = "";
  let callCount3 = 0;
  await buildLessonsWithLLM(mockAnalysis, "SOFTWARE_ENGINEER", mockOrderedConcepts, {
    generateContent: async (prompt) => {
      callCount3++;
      if (callCount3 === 3) call3Prompt = prompt;
      if (callCount3 === 1) return JSON.stringify(validDesignDecisions);
      if (callCount3 === 2) return JSON.stringify(validStubs);
      return JSON.stringify(validQuestions);
    },
  });
  assert(call3Prompt.includes("hook") && call3Prompt.includes("coreInsight") && call3Prompt.includes("tradeoff"), "Call 3 prompt should contain hook, coreInsight, tradeoff");
  assert(!call3Prompt.includes("roleRelevanceNote"), "Call 3 prompt should not contain roleRelevanceNote");
  assert(!call3Prompt.includes("estimatedMinutes"), "Call 3 prompt should not contain estimatedMinutes");
  assert(!call3Prompt.includes('"context"'), "Call 3 Lessons payload should not include context field");

  console.log("llmLessonBuilder.test.ts: all assertions passed.");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
