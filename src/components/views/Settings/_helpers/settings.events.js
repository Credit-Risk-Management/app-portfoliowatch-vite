import { $settingsView, $settingsForm, $organization, $alert } from '@src/signals';
import * as organizationApi from '@src/api/organization.api';

export const setActiveTab = (tab) => {
  $settingsView.update({ activeTab: tab });
};

export const loadOrganizationData = () => {
  const org = $organization.value;
  $settingsForm.update({
    organizationName: org.name || '',
    organizationIndustry: org.industry || '',
  });
};

export const saveOrganization = async () => {
  try {
    const formData = $settingsForm.value;
    const organizationId = $organization.value.id;

    if (!formData.organizationName || formData.organizationName.trim() === '') {
      $alert.update({
        show: true,
        variant: 'danger',
        message: 'Organization name is required',
      });
      return;
    }

    $settingsView.update({ isSaving: true });

    const response = await organizationApi.updateOrganization(organizationId, {
      name: formData.organizationName.trim(),
      industry: formData.organizationIndustry.trim() || undefined,
    });

    // Update organization signal with new data
    $organization.update({
      ...$organization.value,
      name: response.data.name,
      industry: response.data.industry,
    });

    $settingsView.update({ isSaving: false });

    $alert.update({
      show: true,
      variant: 'success',
      message: 'Organization updated successfully',
    });
  } catch (error) {
    $settingsView.update({ isSaving: false });
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update organization';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};
