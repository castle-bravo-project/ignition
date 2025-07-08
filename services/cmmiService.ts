import {
  ASSESSABLE_PA_IDS,
  CMMI_LEVELS,
  CMMI_PA_FULL_NAMES,
} from '../constants';
import {
  CmmiAssessment,
  DocumentSectionData,
  ProcessAreaStatus,
  ProjectData,
} from '../types';

const MIN_DESCRIPTION_LENGTH = 20; // Min characters for a section description to be considered "filled"
const SATISFACTION_THRESHOLD = 80; // Score needed for a PA to be "satisfied"

// --- Helper Functions ---

const calculateDocCompleteness = (
  docId: string,
  data: ProjectData
): { score: number; evidence: string; gaps: string[] } => {
  const doc = data.documents[docId];
  if (!doc)
    return { score: 0, evidence: '', gaps: [`Document '${docId}' not found.`] };

  let totalSections = 0;
  let filledSections = 0;
  const emptySections: string[] = [];

  const recurse = (sections: DocumentSectionData[]) => {
    sections.forEach((s) => {
      totalSections++;
      if (
        s.description &&
        s.description.trim().length > MIN_DESCRIPTION_LENGTH
      ) {
        filledSections++;
      } else {
        emptySections.push(`${doc.title} -> ${s.title}`);
      }
      if (s.children) recurse(s.children);
    });
  };

  if (doc.content) recurse(doc.content);

  if (totalSections === 0)
    return { score: 0, evidence: `${doc.title} has no sections.`, gaps: [] };

  const completeness = Math.round((filledSections / totalSections) * 100);
  const evidence = `${doc.title} is ${completeness}% complete.`;
  const gaps = emptySections.map((s) => `Section '${s}' is incomplete.`);

  return { score: completeness, evidence, gaps };
};

const getArtifactsForPa = (paId: string, data: ProjectData): string[] => {
  const artifacts: string[] = [];
  Object.values(data.documents).forEach((doc) => {
    const findPa = (sections: DocumentSectionData[]) => {
      sections.forEach((s) => {
        if (s.cmmiPaIds.includes(paId)) {
          artifacts.push(`Document Section: ${doc.title} -> ${s.title}`);
        }
        if (s.children) findPa(s.children);
      });
    };
    if (doc.content) findPa(doc.content);
  });
  return artifacts;
};

// --- Process Area Scoring Functions ---

const assess_PP = (
  data: ProjectData
): Omit<ProcessAreaStatus, 'id' | 'name' | 'level'> => {
  const sdpCompleteness = calculateDocCompleteness('sdp', data);
  const score = sdpCompleteness.score;
  const evidence = [sdpCompleteness.evidence];
  const gaps = sdpCompleteness.gaps;

  if (data.requirements.length === 0)
    gaps.push('No requirements are defined to inform planning.');
  else evidence.push(`${data.requirements.length} requirements exist.`);

  return {
    score,
    evidence,
    gaps,
    isSatisfied: score >= SATISFACTION_THRESHOLD,
  };
};

const assess_REQM = (
  data: ProjectData
): Omit<ProcessAreaStatus, 'id' | 'name' | 'level'> => {
  const { requirements, links, documents } = data;
  if (requirements.length === 0)
    return {
      score: 0,
      evidence: [],
      gaps: ['No requirements defined.'],
      isSatisfied: false,
    };

  const reqsWithTests = requirements.filter(
    (r) => links[r.id]?.tests?.length > 0
  ).length;
  const testCoverage = Math.round((reqsWithTests / requirements.length) * 100);
  const score1 = testCoverage * 0.6; // 60% weight

  const srsCompleteness = calculateDocCompleteness('srs', data);
  const score2 = srsCompleteness.score * 0.4; // 40% weight

  const score = Math.round(score1 + score2);
  const evidence = [
    `${testCoverage}% of requirements have test case traceability.`,
    srsCompleteness.evidence,
  ];
  const gaps = requirements
    .filter((r) => !links[r.id]?.tests?.length)
    .map((r) => `Requirement '${r.id}' lacks test case coverage.`);
  gaps.push(...srsCompleteness.gaps);

  return {
    score,
    evidence,
    gaps,
    isSatisfied: score >= SATISFACTION_THRESHOLD,
  };
};

const assess_CM = (
  data: ProjectData
): Omit<ProcessAreaStatus, 'id' | 'name' | 'level'> => {
  const { configurationItems } = data;
  const cmPlanCompleteness = calculateDocCompleteness('cm_plan', data);

  const score1 = configurationItems.length > 0 ? 50 : 0;
  const score2 = cmPlanCompleteness.score * 0.5;
  const score = Math.round(score1 + score2);

  const evidence = [cmPlanCompleteness.evidence];
  if (score1 > 0)
    evidence.push(
      `${configurationItems.length} Configuration Items are tracked.`
    );

  const gaps = cmPlanCompleteness.gaps;
  if (score1 === 0) gaps.push('No Configuration Items have been defined.');

  return {
    score,
    evidence,
    gaps,
    isSatisfied: score >= SATISFACTION_THRESHOLD,
  };
};

const assess_VER_VAL = (
  paId: 'VER' | 'VAL',
  data: ProjectData
): Omit<ProcessAreaStatus, 'id' | 'name' | 'level'> => {
  const { testCases, requirements, links } = data;
  if (testCases.length === 0)
    return {
      score: 0,
      evidence: [],
      gaps: ['No test cases exist.'],
      isSatisfied: false,
    };

  const passedTests = testCases.filter((tc) => tc.status === 'Passed').length;
  const passRate = Math.round((passedTests / testCases.length) * 100);
  const score1 = passRate * 0.5;

  const linkedTests = new Set(Object.values(links).flatMap((l) => l.tests));
  const testsLinkedToReqs = testCases.filter((tc) =>
    linkedTests.has(tc.id)
  ).length;
  const linkRate = Math.round((testsLinkedToReqs / testCases.length) * 100);
  const score2 = linkRate * 0.5;

  const score = Math.round(score1 + score2);
  const evidence = [
    `${passRate}% of tests have passed.`,
    `${linkRate}% of test cases are linked to requirements.`,
  ];
  const gaps = testCases
    .filter((tc) => !linkedTests.has(tc.id))
    .map((tc) => `Test case '${tc.id}' is not linked to any requirement.`);

  return {
    score,
    evidence,
    gaps,
    isSatisfied: score >= SATISFACTION_THRESHOLD,
  };
};

const assess_RSKM = (
  data: ProjectData
): Omit<ProcessAreaStatus, 'id' | 'name' | 'level'> => {
  const { risks, links } = data;
  if (risks.length === 0)
    return {
      score: 0,
      evidence: [],
      gaps: ['No risks have been identified.'],
      isSatisfied: false,
    };

  const mitigatedRisks = risks.filter(
    (r) => r.status === 'Mitigated' || r.status === 'Closed'
  ).length;
  const mitigationRate = Math.round((mitigatedRisks / risks.length) * 100);
  const score1 = mitigationRate * 0.5;

  const linkedRisks = new Set(Object.values(links).flatMap((l) => l.risks));
  const risksLinkedToReqs = risks.filter((r) => linkedRisks.has(r.id)).length;
  const linkRate = Math.round((risksLinkedToReqs / risks.length) * 100);
  const score2 = linkRate * 0.5;

  const score = Math.round(score1 + score2);
  const evidence = [
    `${risks.length} risks are being tracked.`,
    `${mitigationRate}% of risks are mitigated or closed.`,
  ];
  const gaps = risks
    .filter((r) => !linkedRisks.has(r.id))
    .map((r) => `Risk '${r.id}' is not linked to any requirement.`);
  if (risks.some((r) => r.status === 'Open'))
    gaps.push('There are still open risks.');

  return {
    score,
    evidence,
    gaps,
    isSatisfied: score >= SATISFACTION_THRESHOLD,
  };
};

const assess_RD = (
  data: ProjectData
): Omit<ProcessAreaStatus, 'id' | 'name' | 'level'> => {
  // Requirements Development is closely tied to REQM, but focuses more on quality and completeness.
  const reqmAssessment = assess_REQM(data);

  // For simplicity, we'll derive RD from REQM and add a check for non-functional requirements.
  const hasNFR = data.documents?.srs?.content?.some(
    (s) => s.id === 'srs3.2' && s.description.length > MIN_DESCRIPTION_LENGTH
  );
  const score = reqmAssessment.score * (hasNFR ? 1 : 0.8); // Penalize if NFR section is empty

  const evidence = [...reqmAssessment.evidence];
  if (hasNFR) evidence.push('Non-functional requirements section is defined.');

  const gaps = [...reqmAssessment.gaps];
  if (!hasNFR)
    gaps.push('Non-functional requirements section in SRS is incomplete.');

  return {
    score,
    evidence,
    gaps,
    isSatisfied: score >= SATISFACTION_THRESHOLD,
  };
};

const getDefaultAssessment = (
  paId: string
): Omit<ProcessAreaStatus, 'id' | 'name' | 'level'> => {
  const evidence = getArtifactsForPa(paId, { documents: {} } as any); // Check for documents that claim to support it
  const gaps = ['Automated assessment for this PA is not fully implemented.'];
  if (evidence.length === 0)
    gaps.push('No project documents explicitly mention this PA.');

  return {
    score: evidence.length > 0 ? 10 : 0, // Give some points if it's mentioned
    evidence: evidence,
    gaps,
    isSatisfied: false,
  };
};

// --- Main Assessment Function ---

export const calculateCmmiAssessment = (data: ProjectData): CmmiAssessment => {
  const paAssessors: {
    [key: string]: (
      data: ProjectData
    ) => Omit<ProcessAreaStatus, 'id' | 'name' | 'level'>;
  } = {
    PP: assess_PP,
    REQM: assess_REQM,
    CM: assess_CM,
    VER: (d) => assess_VER_VAL('VER', d),
    VAL: (d) => assess_VER_VAL('VAL', d),
    RSKM: assess_RSKM,
    RD: assess_RD,
  };

  const assessment: CmmiAssessment = {
    maturityLevel: 1,
    levelProgress: 0,
    processAreasByLevel: {},
  };

  // Calculate status for all assessable PAs
  const allPaStatuses: ProcessAreaStatus[] = ASSESSABLE_PA_IDS.map((paId) => {
    const assessor = paAssessors[paId] || (() => getDefaultAssessment(paId));
    const result = assessor(data);
    const paLevel = Object.keys(CMMI_LEVELS).find((level) =>
      CMMI_LEVELS[parseInt(level)].includes(paId)
    );

    return {
      id: paId,
      name: CMMI_PA_FULL_NAMES[paId] || paId,
      level: paLevel ? parseInt(paLevel) : 0,
      ...result,
    };
  });

  // Group PAs by level
  allPaStatuses.forEach((paStatus) => {
    if (!assessment.processAreasByLevel[paStatus.level]) {
      assessment.processAreasByLevel[paStatus.level] = [];
    }
    assessment.processAreasByLevel[paStatus.level].push(paStatus);
  });

  // Determine overall maturity level
  let currentLevel = 1;
  for (
    let level = 2;
    level <= Math.max(...Object.keys(CMMI_LEVELS).map(Number));
    level++
  ) {
    const pasForLevel = allPaStatuses.filter((pa) => pa.level === level);
    if (pasForLevel.length > 0 && pasForLevel.every((pa) => pa.isSatisfied)) {
      currentLevel = level;
    } else {
      // This is the level we are working towards
      const satisfiedCount = pasForLevel.filter((pa) => pa.isSatisfied).length;
      assessment.levelProgress =
        pasForLevel.length > 0
          ? Math.round((satisfiedCount / pasForLevel.length) * 100)
          : 0;
      break;
    }
  }
  assessment.maturityLevel = currentLevel;
  if (currentLevel === Math.max(...Object.keys(CMMI_LEVELS).map(Number))) {
    assessment.levelProgress = 100; // Max level achieved
  }

  return assessment;
};
