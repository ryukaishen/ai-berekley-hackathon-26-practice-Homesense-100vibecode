import type { DailyRecoverySignal, AgentResult, SafetyResult } from '../types/index';
import type { BaselineResult } from '../engine/baseline';
import type { FrictionScore } from '../types/index';

const MOCK_RESULT: AgentResult = {
  signalSummary:
    'Mock mode — configure VITE_ANTHROPIC_API_KEY to enable AI summaries. Your wearable signals show deviation from your personal baseline.',
  frictionExplanation: '',
  carePlanSteps: [
    'Mock mode — configure VITE_ANTHROPIC_API_KEY to see personalized next steps.',
    'Rest and limit screen time as a general guideline.',
    'Let your support person know how you are feeling today.',
  ],
  caregiverDraft:
    'Mock mode — configure VITE_ANTHROPIC_API_KEY to enable AI-generated caregiver messages. Today\'s signals suggest the patient should take it easy.',
  clinicianSummary:
    'PROTOTYPE — PATIENT-REPORTED DATA — FOR CLINICAL REVIEW ONLY\n\nMock mode — configure VITE_ANTHROPIC_API_KEY to enable AI-generated clinician summaries.',
  generatedAt: new Date().toISOString(),
  modelUsed: 'mock',
};

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  return data.content.find(b => b.type === 'text')?.text ?? '';
}

export async function runAgentWorkflow(
  today: DailyRecoverySignal,
  baseline: BaselineResult,
  friction: FrictionScore,
  safety: SafetyResult,
  apiKey: string | null,
): Promise<AgentResult> {
  if (safety.blockedAgents) {
    throw new Error('Agent workflow blocked by safety router.');
  }

  const frictionExplanation =
    `Recovery friction score: ${friction.total}/100 (${friction.level}). Top factors: ${friction.topDrivers.join('; ')}.`;

  if (!apiKey) {
    return { ...MOCK_RESULT, frictionExplanation, generatedAt: new Date().toISOString() };
  }

  try {
    // Signal Agent
    const signalSummary = await callClaude(
      apiKey,
      'You are a recovery signal interpreter for a health app. You summarize what changed in a patient\'s wearable data compared to their baseline. You never diagnose, never prescribe, never mention medication, and never make clinical claims. You write in plain language for a non-medical audience. Maximum 3 sentences.',
      `Today's signals: ${JSON.stringify({ today, baseline }, null, 2)}`,
    );

    // Care Plan Agent
    let carePlanSteps: string[];
    const carePlanRaw = await callClaude(
      apiKey,
      'You are a recovery support assistant. Based on the friction score and signal summary provided, generate exactly 3 concrete, specific, non-medical next steps the patient can take today. Never diagnose. Never mention medication. Never say "see a doctor" as a step. Format your response as a JSON array of 3 strings and nothing else.',
      `Friction: ${JSON.stringify(friction)}\nSignal summary: ${signalSummary}`,
    );
    try {
      const parsed = JSON.parse(carePlanRaw) as unknown;
      carePlanSteps = Array.isArray(parsed) ? (parsed as string[]).slice(0, 3) : [];
      if (carePlanSteps.length < 3) throw new Error('too few steps');
    } catch {
      carePlanSteps = [
        'Rest and limit screen time today.',
        'Drink water and eat a small meal.',
        'Let your support person know how you are feeling.',
      ];
    }

    // Caregiver Agent
    const caregiverDraft = await callClaude(
      apiKey,
      'You are helping draft a short support message from a patient to their caregiver or family helper. Write in first person from the patient\'s perspective. Be specific about what changed. Do not diagnose. Do not use medical jargon. Maximum 4 sentences.',
      `Friction: ${friction.level} (${friction.total}/100). Signal: ${signalSummary}. Steps: ${carePlanSteps.join('; ')}.`,
    );

    // Clinician Summary Agent
    const clinicianSummary = await callClaude(
      apiKey,
      'You are generating a structured factual handoff note for a clinician or care coordinator. Summarize only patient-reported data and wearable signals. Do not diagnose. Do not recommend treatment. Label all data as patient-reported. Maximum 6 sentences. Begin with: PROTOTYPE — PATIENT-REPORTED DATA — FOR CLINICAL REVIEW ONLY.',
      `7-day trend date: ${today.date}. Today: ${JSON.stringify(today)}. Friction: ${frictionExplanation}`,
    );

    return {
      signalSummary,
      frictionExplanation,
      carePlanSteps,
      caregiverDraft,
      clinicianSummary,
      generatedAt: new Date().toISOString(),
      modelUsed: 'claude-sonnet-4-6',
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return {
      signalSummary: `AI agent error: ${errMsg}. Showing mock output.`,
      frictionExplanation,
      carePlanSteps: MOCK_RESULT.carePlanSteps,
      caregiverDraft: MOCK_RESULT.caregiverDraft,
      clinicianSummary: MOCK_RESULT.clinicianSummary,
      generatedAt: new Date().toISOString(),
      modelUsed: 'mock-fallback',
    };
  }
}
