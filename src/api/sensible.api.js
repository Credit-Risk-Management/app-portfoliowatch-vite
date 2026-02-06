import apiClient from './client';

/**
 * POST to Sensible API to get financial data
 */
export default async function postToSensibleApi(data) {
  try {
    const response = await apiClient.post('/sensible-api', data);
    return response;
  } catch (error) {
    console.error('Post to Sensible API error:', error);
    throw error;
  }
}

/**
 * POST to Sensible API to initiate upload
 */
export const initiateUploadToSensibleApi = async (data) => {
  try {
    const response = await apiClient.post('/sensible-api/upload/initiate', data);
    return response;
  } catch (error) {
    console.error('Initiate upload to Sensible API error:', error);
    throw error;
  }
};
