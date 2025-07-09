import { GoogleGenAI } from '@google/genai';
import {
  Document,
  PrAnalysisResult,
  ProcessAreaStatus,
  ProcessAsset,
  ProjectData,
  PullRequest,
  PullRequestFile,
  Requirement,
  TestCase,
} from '../types';

const model = 'gemini-2.5-flash-preview-04-17';

const getAiClient = (): GoogleGenAI | undefined => {
  // Check for API key in localStorage first, then environment variables (for development)
  const apiKey =
    (typeof window !== 'undefined' && localStorage.getItem('gemini_api_key')) ||
    (typeof process !== 'undefined' && process.env?.API_KEY) ||
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_GEMINI_API_KEY);

  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    console.warn(
      'Gemini API key not found. Please set your API key in Settings to enable AI features.'
    );
    return undefined;
  }
  return new GoogleGenAI({ apiKey });
};

const CHAT_SYSTEM_INSTRUCTION = `You are an expert consultant specializing in CMMI (Capability Maturity Model Integration) and modern software development best practices. Your name is 'Ignition AI'. 
Provide clear, concise, and actionable advice based on the user's questions. 
When asked about documents like SDP (Software Development Plan), SAD (Software Architecture Document), or processes, give structured answers, possibly using markdown for lists or key points.
Be helpful and encouraging.`;

// Helper to create a concise summary of the project
const getProjectContextSummary = (data: ProjectData): string => {
  const docSummaries = Object.values(data.documents)
    .map((doc) => {
      const topLevelSections = (doc.content || [])
        .map((s) => s.title)
        .join(', ');
      return `- ${doc.title}: Contains sections like ${topLevelSections}. Some content may already exist.`;
    })
    .join('\n');

  const reqSummary = `There are ${
    (data.requirements || []).length
  } requirements defined. Priorities are: ${[
    ...new Set((data.requirements || []).map((r) => r.priority)),
  ].join(', ')}.`;

  return `PROJECT NAME: ${data.projectName}\n\nDOCUMENTATION OVERVIEW:\n${docSummaries}\n\nREQUIREMENTS OVERVIEW:\n${reqSummary}`;
};

export async function* streamChat(
  userInput: string
): AsyncGenerator<string, void, undefined> {
  const ai = getAiClient();
  if (!ai) {
    yield 'AI features are currently disabled because the API key is not configured. Please contact the administrator.';
    return;
  }

  try {
    const result = await ai.models.generateContentStream({
      model: model,
      contents: userInput,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });

    for await (const chunk of result) {
      yield chunk.text;
    }
  } catch (error) {
    console.error('Error streaming chat response:', error);
    yield 'There was an issue communicating with the AI. Please check the console for details and try again later.';
  }
}

async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return 'AI features are currently disabled because the API key is not configured. Please contact the administrator.';
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating text:', error);
    return 'There was an issue communicating with the AI. Please check the console for details and try again later.';
  }
}

export async function improveContent(text: string): Promise<string> {
  const prompt = `Improve the following text for clarity, completeness, and professional tone, while keeping it concise: \n\n---\n${text}\n---`;
  const systemInstruction =
    'You are an expert CMMI consultant and technical writer.';
  return generateText(prompt, systemInstruction);
}

export async function getPaInfo(
  paId: string,
  paFullName: string
): Promise<string> {
  const prompt = `
You are a CMMI expert. Explain the CMMI Process Area: **${paFullName} (${paId})**.

Describe its purpose and key goals. Then, explain its relationship to software development plan guidelines (like DI-IPSC-81427B).

The context for DI-IPSC-81427B is: 'The Software Development Plan (SDP) provides the acquirer insight into, and a tool for monitoring, the processes to be followed for software development, the methods to be used, the approach to be followed for each activity, and project schedules, organization, and resources.'

Present the information in a clear, well-structured format. Use headings for different sections and bullet points for lists.
    `;
  return generateText(prompt);
}

export async function generateDocumentSectionContent(
  documentTitle: string,
  sectionTitle: string,
  projectContext: string
): Promise<string> {
  const prompt = `You are a world-class CMMI consultant and technical writer named Ignition AI.
Your task is to generate the content for a specific section of a project document.
Based on the following overall project context, write the content for the section: "${sectionTitle}" within the document: "${documentTitle}".

The content should be professional, comprehensive, and align with best practices for software project documentation.
Generate *only* the text for the section description. Do not include the section title, markdown headings, or any other surrounding text or explanation.

---
PROJECT CONTEXT:
${projectContext}
---
`;
  const systemInstruction =
    'You are an expert CMMI consultant and technical writer.';
  return generateText(prompt, systemInstruction);
}

export async function suggestRequirementDetails(
  documents: { [key: string]: Document },
  existingRequirements: Requirement[]
): Promise<{ suggestedId: string; suggestedDescription: string }> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('AI client not available. Please configure the API Key.');
  }

  const docToString = (doc: Document | undefined) =>
    doc
      ? doc.content.map((s) => `${s.title}: ${s.description}`).join('\n')
      : 'Not available.';

  const context = `
        DOCUMENTATION CONTEXT:
        ---
        Software Development Plan (SDP) Snippets:
        ${docToString(documents['sdp'])}
        ---
        Software Requirements Specification (SRS) Snippets:
        ${docToString(documents['srs'])}
        ---
        Configuration Management (CM) Plan Snippets:
        ${docToString(documents['cm_plan'])}
        ---
    `;

  const existingIds =
    existingRequirements.map((r) => r.id).join(', ') || 'None';

  const prompt = `
        ${context}
        EXISTING REQUIREMENT IDs:
        ${existingIds}
        ---
        TASK:
        You are an expert requirements analyst. Based on the provided documentation context and the list of existing requirements, suggest details for a NEW requirement.
        1.  ID Suggestion: Analyze the existing IDs and any numbering conventions mentioned in the documents (like CM Plan or SRS). Generate the next logical, unique ID. If no convention is clear, increment the highest existing number (e.g., if REQ-006 exists, suggest REQ-007).
        2.  Description Suggestion: Based on the project scope in the documentation, suggest a plausible and well-formed functional or non-functional requirement that appears to be missing or would be a logical next step for the project.

        Return your answer as a single, raw JSON object with the keys "suggestedId" and "suggestedDescription". Do not include any other text, explanations, or markdown code fences.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (
      typeof parsed.suggestedId === 'string' &&
      typeof parsed.suggestedDescription === 'string'
    ) {
      return parsed;
    } else {
      console.error('AI response did not match expected format:', parsed);
      throw new Error('AI response was not in the expected format.');
    }
  } catch (error) {
    console.error('Error suggesting requirement details:', error);
    throw new Error(
      'Failed to get AI suggestion. Please check the console for details.'
    );
  }
}

export async function suggestTestCasesForRequirement(
  requirement: Requirement,
  existingTestCases: TestCase[],
  projectContext: string
): Promise<TestCase[]> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('AI client not available. Please configure the API Key.');
  }

  const existingIds = existingTestCases.map((tc) => tc.id).join(', ') || 'None';
  const lastId =
    existingTestCases.length > 0
      ? [...existingTestCases].sort((a, b) => a.id.localeCompare(b.id)).pop()!
          .id
      : 'TC-000';
  const lastNumMatch = lastId.match(/\d+$/);
  const lastNum = lastNumMatch ? parseInt(lastNumMatch[0]) : 0;

  const prompt = `
    You are an expert QA Engineer and automation specialist. Your task is to generate test cases for a given software requirement.
    
    PROJECT CONTEXT:
    ${projectContext}
    ---
    REQUIREMENT TO TEST:
    - ID: ${requirement.id}
    - Description: ${requirement.description}
    - Priority: ${requirement.priority}
    - Status: ${requirement.status}
    ---
    EXISTING TEST CASE IDs:
    ${existingIds}
    ---
    TASK:
    Generate 2 to 3 relevant test cases for the requirement above. For each test case, provide:
    1.  A unique ID. The next available ID should start from TC-${(lastNum + 1)
      .toString()
      .padStart(3, '0')}.
    2.  A concise, human-readable description.
    3.  A simple BDD-style Gherkin script (Feature, Scenario, Given, When, Then) for test automation.

    Return your answer as a single, raw JSON array of objects. Each object must have the keys "id", "description", and "gherkin". Do not include any other text, explanations, or markdown code fences.

    Example format:
    [
        {
            "id": "TC-00X",
            "description": "A test for something.",
            "gherkin": "Feature: Feature Name\\n  Scenario: Scenario Name\\n    Given a precondition\\n    When an action occurs\\n    Then an outcome is expected."
        }
    ]
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) => 'id' in item && 'description' in item && 'gherkin' in item
      )
    ) {
      return parsed.map((p) => ({ ...p, status: 'Not Run' }));
    } else {
      console.error('AI response did not match expected format:', parsed);
      throw new Error(
        'AI response was not in the expected format of an array of TestCase objects.'
      );
    }
  } catch (error) {
    console.error('Error suggesting test cases:', error);
    throw new Error(
      'Failed to get AI suggestion for test cases. Please check the console for details.'
    );
  }
}

export async function generateCmmiRecommendations(
  paStatus: ProcessAreaStatus,
  projectContext: string
): Promise<string> {
  const { name, id, gaps, score } = paStatus;
  const prompt = `
You are a CMMI Level 5 Lead Appraiser with expertise in software engineering. Your name is Ignition AI.
A user is trying to improve their project's compliance with a CMMI Process Area using the 'Ignition AI' tool.

PROCESS AREA: ${name} (${id})
CURRENT SCORE: ${score}/100

CURRENTLY IDENTIFIED GAPS:
- ${
    gaps.join('\n- ') ||
    'No specific gaps automatically identified, but improvement is still needed.'
  }

OVERALL PROJECT CONTEXT:
${projectContext}
---
TASK:
Provide a short, actionable list of 2-3 recommendations for how the user can address these gaps and improve their score for this Process Area.
Frame the recommendations in terms of concrete actions the user can take *within the Ignition AI application*.
For example, instead of "Improve requirements," say "Navigate to the 'Requirements' page and link test case TC-005 to requirement REQ-006."
Or, instead of "Flesh out the plan," say "Go to the 'Documents' page, open the 'Software Development Plan (SDP)', and complete section '3.3 Resource Allocation'."

Be specific, concise, and helpful. Use markdown for a clear, readable list.
    `;
  return generateText(prompt);
}

export async function generateIssueTemplates(
  projectData: ProjectData
): Promise<Record<string, string>> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('AI client not available. Please configure the API Key.');
  }

  const context = getProjectContextSummary(projectData);
  const reqIds = projectData.requirements
    .map((r) => r.id)
    .slice(0, 5)
    .join(', ');
  const ciNames = projectData.configurationItems
    .map((c) => c.name)
    .slice(0, 5)
    .join(', ');

  const prompt = `
    You are an expert DevOps engineer specializing in GitHub workflows.
    Your task is to generate the content for two standard GitHub issue templates: a bug report and a feature request.
    These templates must be customized based on the provided project context. They must be in the correct YAML Frontmatter format for GitHub.

    PROJECT CONTEXT:
    ---
    ${context}
    ---
    Relevant Requirement IDs (Examples): ${reqIds}
    Relevant Configuration Items (Examples): ${ciNames}
    ---
    TASK:
    Generate content for 'bug_report.md' and 'feature_request.md'.
    - The bug report should ask for steps to reproduce, expected vs. actual behavior, and which Configuration Item might be affected.
    - The feature request should ask for a description of the problem it solves, a proposed solution, and how it relates to existing requirements.
    - Use YAML frontmatter to define the name, description, and labels for each template. Use relevant labels like "bug", "enhancement", "documentation".

    Return your answer as a single, raw JSON object where keys are the filenames ("bug_report.md", "feature_request.md") and values are the complete markdown content for each file.
    Do not include any other text, explanations, or markdown code fences.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'bug_report.md' in parsed &&
      'feature_request.md' in parsed
    ) {
      return parsed;
    } else {
      console.error(
        'AI response did not match expected format for issue templates:',
        parsed
      );
      throw new Error(
        'AI response was not in the expected format for issue templates.'
      );
    }
  } catch (error) {
    console.error('Error generating issue templates:', error);
    throw new Error(
      'Failed to get AI-generated issue templates. Please check the console for details.'
    );
  }
}

export async function analyzePullRequest(
  pr: PullRequest,
  prFiles: PullRequestFile[],
  projectData: ProjectData
): Promise<PrAnalysisResult> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('AI client not available. Please configure the API Key.');
  }

  const { requirements, configurationItems, risks } = projectData;

  const prompt = `
    You are an expert project manager and CMMI Level 5 lead appraiser named Ignition AI. Your task is to analyze a GitHub Pull Request (PR) in the context of a larger software project.

    === PROJECT CONTEXT ===
    Requirements:
    ${JSON.stringify(
      requirements.map((r) => ({
        id: r.id,
        description: r.description,
        status: r.status,
      })),
      null,
      2
    )}
    
    Configuration Items (CIs):
    ${JSON.stringify(
      configurationItems.map((ci) => ({
        id: ci.id,
        name: ci.name,
        type: ci.type,
        version: ci.version,
      })),
      null,
      2
    )}

    Risks:
    ${JSON.stringify(
      risks.map((r) => ({
        id: r.id,
        description: r.description,
        status: r.status,
      })),
      null,
      2
    )}
    =======================

    === PULL REQUEST TO ANALYZE ===
    PR Number: ${pr.number}
    PR Title: "${pr.title}"
    PR Author: ${pr.user.login}
    Changed Files:
    ${JSON.stringify(prFiles, null, 2)}
    ============================

    === YOUR TASK ===
    Analyze the PR and provide a structured JSON response.
    1.  **summary**: Write a brief, one-paragraph summary of what this PR accomplishes and its potential impact on the project based on the changed files and title.
    2.  **linkedRequirementIds**: Based on the PR title and changed files, identify the IDs of ALL relevant requirements from the project context that this PR seems to implement, fix, or address. This should be an array of strings. If none, return an empty array.
    3.  **linkedCiIds**: Identify the IDs of ALL Configuration Items from the project context that are directly modified or impacted by the changed files. This should be an array of strings. If none, return an empty array.
    4.  **linkedRiskIds**: Identify the IDs of ALL risks from the project context that might be related to or mitigated by this PR. This should be an array of strings. If none, return an empty array.
    5.  **suggestedCommitMessage**: Write an ideal, well-formatted commit message for merging this PR. It should follow conventional commit standards (e.g., "feat(scope): title"), include a body explaining the change, and reference the identified requirement IDs (e.g., "Closes: REQ-001, REQ-003").

    Return your answer as a single, raw JSON object with the keys "summary", "linkedRequirementIds", "linkedCiIds", "linkedRiskIds", and "suggestedCommitMessage". Do not include any other text, explanations, or markdown code fences.
    `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Validate the structure of the parsed response
    if (
      typeof parsed.summary === 'string' &&
      Array.isArray(parsed.linkedRequirementIds) &&
      Array.isArray(parsed.linkedCiIds) &&
      Array.isArray(parsed.linkedRiskIds) &&
      typeof parsed.suggestedCommitMessage === 'string'
    ) {
      // Map IDs back to full objects
      const result: PrAnalysisResult = {
        summary: parsed.summary,
        suggestedCommitMessage: parsed.suggestedCommitMessage,
        linkedRequirements: requirements.filter((r) =>
          parsed.linkedRequirementIds.includes(r.id)
        ),
        linkedCis: configurationItems.filter((ci) =>
          parsed.linkedCiIds.includes(ci.id)
        ),
        linkedRisks: risks.filter((r) => parsed.linkedRiskIds.includes(r.id)),
      };
      return result;
    } else {
      console.error(
        'AI response did not match expected PR analysis format:',
        parsed
      );
      throw new Error(
        'AI response was not in the expected format for PR analysis.'
      );
    }
  } catch (error) {
    console.error('Error analyzing pull request:', error);
    throw new Error(
      'Failed to get AI analysis for the pull request. Please check the console for details.'
    );
  }
}

export async function scaffoldRepositoryFiles(
  projectData: ProjectData
): Promise<Record<string, string>> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('AI client not available. Please configure the API Key.');
  }

  const context = getProjectContextSummary(projectData);

  const prompt = `
    You are an expert DevOps engineer and GitHub App developer. Your task is to generate a COMPLETE repository structure for a production-ready GitHub App that deploys via GitHub Pages.

    This is a META-COMPLIANCE demonstration where the Ignition tool is creating its own deployment repository - the tool managing its own development process!

    PROJECT CONTEXT:
    ---
    ${context}
    ---

    CRITICAL REQUIREMENTS:
    - This must be a COMPLETE, deployable React/TypeScript application
    - Must include GitHub Pages deployment workflow
    - Must include GitHub App manifest for marketplace listing
    - Must include the current project data as ignition-project.json
    - Must demonstrate meta-compliance (tool managing itself)

    TASK:
    Generate content for the following files:
    1.  ".gitignore": Comprehensive gitignore for Node.js/React with dist/, build/, .env*, node_modules/, etc.
    2.  "README.md": Professional README for a GitHub App. Include badges, installation instructions, features, and meta-compliance explanation.
    3.  "package.json": COMPLETE package.json with ALL dependencies for React, TypeScript, Vite, Lucide icons, Chart.js, etc. Include build, dev, and preview scripts.
    4.  "vite.config.ts": Vite configuration for GitHub Pages deployment with proper base path.
    5.  ".github/workflows/deploy.yml": GitHub Actions workflow for building and deploying to GitHub Pages. Must build the React app and deploy to gh-pages branch.
    6.  ".github/workflows/ci.yml": CI workflow for testing and quality checks.
    7.  "github-app-manifest.json": Complete GitHub App manifest for marketplace submission.
    8.  ".github/CONTRIBUTING.md": Professional contributing guide for open source project.
    9.  ".github/PULL_REQUEST_TEMPLATE.md": PR template with compliance checklist.
    10. "tsconfig.json": TypeScript configuration for React project.

    Return your answer as a single, raw JSON object where keys are the full file paths and values are the complete string content for each file.
    Do not include any other text, explanations, or markdown code fences.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Object.keys(parsed).length > 0
    ) {
      // Add the current project data to the scaffolded files
      parsed['ignition-project.json'] = JSON.stringify(projectData, null, 2);

      // Create initial audit log file for persistent compliance logging
      const initialAuditLog = {
        auditLog: [
          {
            id: `audit_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            actor: 'System',
            eventType: 'AUDIT_LOG_INIT',
            summary: 'Audit log initialized during repository scaffolding',
            details: {
              projectName: projectData.projectName,
              scaffoldedFiles: Object.keys(parsed).length + 2, // +2 for project.json and audit-log.json
              metaCompliance: true,
            },
          },
        ],
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          projectName: projectData.projectName,
          description:
            'Persistent audit log for Ignition meta-compliance tracking',
        },
      };

      parsed['audit-log.json'] = JSON.stringify(initialAuditLog, null, 2);

      return parsed;
    } else {
      console.error(
        'AI response did not match expected format for repo scaffolding:',
        parsed
      );
      throw new Error(
        'AI response was not in the expected format for repo scaffolding.'
      );
    }
  } catch (error) {
    console.error('Error scaffolding repository files:', error);
    throw new Error(
      'Failed to get AI-generated repository files. Please check the console for details.'
    );
  }
}

export async function generateTestWorkflowFiles(): Promise<
  Record<string, string>
> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('AI client not available. Please configure the API Key.');
  }

  const prompt = `
You are an expert DevOps engineer. Your task is to generate two files for setting up an automated testing pipeline that reads test cases from an 'ignition-project.json' file.
The output must be a single raw JSON object with two keys: '.github/workflows/ignition-testing.yml' and 'scripts/ignition-test-runner.js'.

File 1: '.github/workflows/ignition-testing.yml'
This GitHub Actions workflow must:
- Be named 'Ignition Automated Testing'.
- Trigger on push and pull_request events for the 'main' branch.
- Have 'contents: write' permissions.
- Use a single job named 'test'.
- Steps:
    1. Checkout the repository.
    2. Setup Node.js v20.
    3. Run 'npm install'.
    4. Execute the test runner script: 'node ./scripts/ignition-test-runner.js'.

File 2: 'scripts/ignition-test-runner.js'
This Node.js script must perform the following actions sequentially using 'fs' and 'child_process':
1.  Define a helper function 'execSync' to run shell commands and log their output.
2.  Read the project data from './ignition-project.json'.
3.  Prepare a temporary directory 'ignition-tests' for the feature files (delete if exists, then create).
4.  Iterate through 'projectData.testCases'. For each test case with a non-empty 'gherkin' script, write its content to a file named 'ignition-tests/[TEST_CASE_ID].feature'.
5.  Execute the Cucumber test runner: 'npx cucumber-js ignition-tests --format json:test-results.json || true'. The '|| true' is important to prevent the workflow from failing if tests fail, so we can process the results.
6.  Check if 'test-results.json' was created. If not, log an error and exit gracefully.
7.  Read and parse 'test-results.json'.
8.  Iterate through the Cucumber JSON results. For each feature (which corresponds to a test case), determine if all its scenarios and steps passed.
9.  Update the original 'projectData' object in memory:
    - Find the matching 'TestCase' by its ID (derived from the feature file URI).
    - Set its 'status' to 'Passed' or 'Failed'.
    - Set its 'updatedBy' to 'Automation'.
    - Set its 'updatedAt' to the current ISO string.
10. Check if any test statuses were changed. If not, log 'No test status changes needed.' and exit.
11. If there were changes, write the updated 'projectData' back to 'ignition-project.json'.
12. Configure git with a bot identity ('github-actions[bot]' and email).
13. Commit and push the updated 'ignition-project.json' to the repository. The commit message must be 'chore(testing): update automated test results'.
The script should handle errors gracefully and log its progress to the console.
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      '.github/workflows/ignition-testing.yml' in parsed &&
      'scripts/ignition-test-runner.js' in parsed
    ) {
      return parsed;
    } else {
      console.error(
        'AI response did not match expected format for test workflow:',
        parsed
      );
      throw new Error(
        'AI response was not in the expected format for the test workflow.'
      );
    }
  } catch (error) {
    console.error('Error generating test workflow files:', error);
    throw new Error(
      'Failed to get AI-generated test workflow files. Please check the console for details.'
    );
  }
}

export async function scanForProcessAssets(
  projectData: ProjectData
): Promise<ProcessAsset[]> {
  const ai = getAiClient();
  if (!ai) {
    // Return mock data for testing when API key is not configured
    console.log(
      'AI client not available. Returning mock process assets for testing.'
    );
    return [
      {
        id: 'PA-AUTH-001',
        name: 'User Authentication Requirement',
        type: 'Requirement Archetype',
        description:
          'Template for user authentication and authorization requirements',
        content:
          'The system shall provide secure user authentication using industry-standard protocols. Users must be able to log in with username/password, and the system shall support multi-factor authentication for enhanced security.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'AI',
        updatedBy: 'AI',
      },
      {
        id: 'PA-RISK-001',
        name: 'Data Security Risk',
        type: 'Risk Playbook',
        description:
          'Common data security risk template with mitigation strategies',
        content:
          'Risk of unauthorized access to sensitive user data. Mitigation: Implement encryption at rest and in transit, regular security audits, and access controls.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'AI',
        updatedBy: 'AI',
      },
    ];
  }

  const contextSummary = getProjectContextSummary(projectData);
  const requirementsSummary = projectData.requirements
    .map((r) => r.description)
    .join('; ');
  const risksSummary = projectData.risks.map((r) => r.description).join('; ');
  const existingAssetNames = (projectData.processAssets || [])
    .map((a) => a.name)
    .join(', ');

  const prompt = `
    You are an expert systems engineer and CMMI consultant. Your task is to analyze a software project's data and identify recurring patterns or well-defined items that can be generalized into reusable process assets.

    A Process Asset can be one of four types:
    - 'Requirement Archetype': A template for a common type of requirement (e.g., user authentication, data validation).
    - 'Solution Blueprint': A high-level technical approach for a common problem (e.g., implementing a cache layer, a REST API endpoint structure).
    - 'Risk Playbook': A template for a common risk, including its potential mitigation steps.
    - 'Test Strategy': A standard approach for testing a particular type of feature.

    PROJECT CONTEXT:
    ---
    ${contextSummary}

    Existing Requirements Snippets: ${requirementsSummary.slice(0, 1000)}...
    Existing Risks Snippets: ${risksSummary.slice(0, 1000)}...
    Existing Process Asset Names: ${existingAssetNames || 'None'}
    ---
    TASK:
    Analyze the project context. Identify 3 to 5 new, distinct, reusable patterns that are not already covered by the existing process assets. For each pattern, generate a process asset.
    - The 'id' must be a unique string starting with "PA-" followed by an 8-character uppercase alphanumeric string.
    - The 'name' should be a concise title.
    - The 'description' should explain what the asset is for.
    - The 'content' should be the reusable template data (e.g., a markdown template for a requirement, a list of steps for a solution, etc.).

    Return your answer as a single, raw JSON array of objects, where each object conforms to the ProcessAsset schema (id, name, type, description, content). Do not include any other text, explanations, or markdown code fences.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) =>
          'id' in item &&
          'name' in item &&
          'type' in item &&
          'description' in item &&
          'content' in item
      )
    ) {
      const existingAssetIds = new Set(
        (projectData.processAssets || []).map((a) => a.id)
      );
      return parsed.filter((p) => !existingAssetIds.has(p.id));
    } else {
      console.error(
        'AI response for process assets did not match expected format:',
        parsed
      );
      throw new Error(
        'AI response was not in the expected format of an array of ProcessAsset objects.'
      );
    }
  } catch (error) {
    console.error('Error scanning for process assets:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    throw new Error(
      `Failed to get AI-suggested process assets: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function suggestRelevantAsset(
  userInput: string,
  processAssets: ProcessAsset[],
  assetType: ProcessAsset['type']
): Promise<ProcessAsset | null> {
  const ai = getAiClient();
  if (!ai) {
    // Return mock suggestion for testing when API key is not configured
    console.log(
      'AI client not available. Returning mock asset suggestion for testing.'
    );
    const relevantAssets = processAssets.filter(
      (asset) => asset.type === assetType
    );
    if (relevantAssets.length > 0 && userInput.toLowerCase().includes('auth')) {
      return (
        relevantAssets.find((asset) =>
          asset.name.toLowerCase().includes('auth')
        ) || null
      );
    }
    return null;
  }

  const relevantAssets = processAssets.filter(
    (asset) => asset.type === assetType
  );
  if (relevantAssets.length === 0) {
    return null;
  }

  const prompt = `
    Given the user's input text and a list of process assets, determine which asset is the most relevant match.

    User Input: "${userInput}"

    Available Assets:
    ${relevantAssets
      .map(
        (asset) => `
    ID: ${asset.id}
    Name: ${asset.name}
    Description: ${asset.description}
    Content Preview: ${asset.content.substring(0, 200)}...
    `
      )
      .join('\n')}

    Analyze the user's input and determine if it matches any of the available assets based on:
    - Similar concepts or terminology
    - Related functionality or purpose
    - Overlapping requirements or risks

    Return the ID of the best matching asset, or "null" if no good match exists (similarity threshold should be at least 60%).

    Return only the asset ID or "null", nothing else.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: 'text/plain' },
    });

    const result = response.text.trim();

    if (result === 'null') {
      return null;
    }

    const matchedAsset = relevantAssets.find((asset) => asset.id === result);
    return matchedAsset || null;
  } catch (error) {
    console.error('Error suggesting relevant asset:', error);
    return null; // Fail silently for suggestions
  }
}
