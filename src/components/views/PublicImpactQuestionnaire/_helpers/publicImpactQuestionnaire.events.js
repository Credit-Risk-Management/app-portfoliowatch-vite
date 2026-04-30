import * as resolvers from './publicImpactQuestionnaire.resolvers';

export const handleSubmitPublicImpactQuestionnaire = (token) => {
  resolvers.submitImpactQuestionnairePublicForm(token);
};
export default handleSubmitPublicImpactQuestionnaire;
