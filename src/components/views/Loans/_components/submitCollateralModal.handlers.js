import { $user, $loan } from '@src/consts/consts';
import loanCollateralValueApi from '@src/api/loanCollateralValue.api';
import { successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $loanCollateralView, $loanCollateralForm, $collateralDocUploader, $collateralModalState } from './submitCollateralModal.signals';

/**
 * Handles closing the submit collateral modal and resetting all state
 */
export const handleClose = () => {
  $loanCollateralView.update({
    showSubmitModal: false,
    isEditMode: false,
    editingCollateralId: null,
  });
  $loanCollateralForm.reset();
  $collateralDocUploader.update({ collateralDoc: null });

  // Revoke document URL if exists
  const { documentPreviewUrl } = $collateralModalState.value;
  if (documentPreviewUrl) {
    URL.revokeObjectURL(documentPreviewUrl);
  }

  $collateralModalState.update({
    isSubmitting: false,
    error: null,
    documentPreviewUrl: null,
    uploadedDocument: null,
  });
};

/**
 * Handles adding a new collateral item row
 */
export const handleAddCollateralItem = () => {
  const { collateralItems } = $loanCollateralForm.value;
  $loanCollateralForm.update({
    collateralItems: [...collateralItems, { description: '', value: '' }],
  });
};

/**
 * Handles removing a collateral item row
 */
export const handleRemoveCollateralItem = (index) => {
  const { collateralItems } = $loanCollateralForm.value;
  if (collateralItems.length <= 1) {
    return; // Keep at least one item
  }
  const updatedItems = collateralItems.filter((_, i) => i !== index);
  $loanCollateralForm.update({ collateralItems: updatedItems });
};

/**
 * Handles updating a specific collateral item
 */
export const handleUpdateCollateralItem = (index, field, value) => {
  const { collateralItems } = $loanCollateralForm.value;
  const updatedItems = [...collateralItems];
  updatedItems[index] = { ...updatedItems[index], [field]: value };
  $loanCollateralForm.update({ collateralItems: updatedItems });
};

/**
 * Handles file upload for collateral document
 */
export const handleFileUpload = async () => {
  const file = $collateralDocUploader.value.collateralDoc;

  if (!file) return;

  // Create preview URL
  const previewUrl = URL.createObjectURL(file);

  $collateralModalState.update({
    documentPreviewUrl: previewUrl,
    uploadedDocument: {
      file,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    },
  });

  // Clear the uploader
  $collateralDocUploader.update({ collateralDoc: null });
};

/**
 * Handles removing the uploaded document
 */
export const handleRemoveDocument = () => {
  const { documentPreviewUrl } = $collateralModalState.value;
  if (documentPreviewUrl) {
    URL.revokeObjectURL(documentPreviewUrl);
  }

  $collateralModalState.update({
    documentPreviewUrl: null,
    uploadedDocument: null,
  });

  $loanCollateralForm.update({ hasDocument: false });
};

/**
 * Validates the form data
 */
const validateForm = () => {
  const { asOfDate, collateralItems } = $loanCollateralForm.value;

  if (!asOfDate) {
    throw new Error('As Of Date is required');
  }

  // Validate that at least one item has both description and value
  const validItems = collateralItems.filter(
    (item) => item.description.trim() && item.value,
  );

  if (validItems.length === 0) {
    throw new Error('At least one collateral item with description and value is required');
  }

  // Validate all values are numbers
  for (const item of validItems) {
    if (isNaN(parseFloat(item.value)) || parseFloat(item.value) < 0) {
      throw new Error(`Invalid value for "${item.description}". Must be a positive number.`);
    }
  }

  return validItems;
};

/**
 * Handles form submission
 */
export const handleSubmit = async () => {
  try {
    $collateralModalState.update({ isSubmitting: true, error: null });

    // Validate form
    const validItems = validateForm();

    const { asOfDate, notes } = $loanCollateralForm.value;
    const { currentLoanId } = $loanCollateralView.value;
    const { uploadedDocument } = $collateralModalState.value;

    if (!currentLoanId) {
      throw new Error('No loan selected');
    }

    // Parse collateral items to ensure values are numbers
    const collateralItems = validItems.map((item) => ({
      description: item.description.trim(),
      value: parseFloat(item.value),
    }));

    // Prepare the data
    const data = {
      loanId: currentLoanId,
      asOfDate,
      collateralItems,
      submittedBy: $user.value?.user?.email || 'Unknown',
      notes: notes || undefined,
      organizationId: $user.value?.user?.organizationId,
    };

    // TODO: Implement document upload to Firebase Storage
    // For now, we're just tracking that a document was attached
    if (uploadedDocument) {
      data.documentName = uploadedDocument.fileName;
      // In a real implementation, we would upload to Firebase Storage here
      // and get back a URL to store in documentUrl
    }

    // Submit to API
    const response = await loanCollateralValueApi.create(data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to submit collateral value');
    }

    // Success
    successAlert('Collateral value submitted successfully!');

    // Trigger refresh
    $loanCollateralView.update({
      refreshTrigger: $loanCollateralView.value.refreshTrigger + 1,
    });

    // Optionally refresh loan detail if needed
    if ($loan.value?.loan?.id === currentLoanId) {
      // Could trigger a loan refresh here if needed
    }

    handleClose();
  } catch (error) {
    console.error('Error submitting collateral value:', error);
    $collateralModalState.update({
      error: error.message || 'An error occurred while submitting',
      isSubmitting: false,
    });
  }
};

/**
 * Calculate total collateral value
 */
export const calculateTotalValue = () => {
  const { collateralItems } = $loanCollateralForm.value;
  return collateralItems.reduce((sum, item) => {
    const value = parseFloat(item.value);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
};
