import publicClient from './publicClient';

/** GET public questionnaire context (no auth). */
export const getImpactQuestionnairePublic = async (token) => publicClient.get(`/borrowers/public/impact-questionnaire/${encodeURIComponent(token)}`);

/** POST questionnaire answers (no auth). */
export const submitImpactQuestionnairePublic = async (token, body) => publicClient.post(
  `/borrowers/public/impact-questionnaire/${encodeURIComponent(token)}/submit`,
  body,
);
