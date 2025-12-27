import { $loan } from '@src/consts/consts';
import { $user } from '@src/signals';
import loanCollateralValueApi from '@src/api/loanCollateralValue.api';
import { successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { fetchLoanDetail } from '@src/components/views/Loans/_helpers/loans.resolvers';
import { $loanCollateralView, $loanCollateralForm, $collateralDocUploader, $collateralModalState } from './submitCollateralModal.signals';

/**
 * Handles opening the modal and loading existing collateral if in edit mode
 */
export const handleOpenModal = async () => {
  const { isEditMode, editingCollateralId } = $loanCollateralView.value;

  if (isEditMode && editingCollateralId) {
    try {
      // Load the existing collateral value
      const response = await loanCollateralValueApi.getById(editingCollateralId);
      const collateral = response?.data || response;

      if (collateral) {
        // Format the asOfDate for the date input (YYYY-MM-DD)
        const asOfDate = collateral.asOfDate
          ? new Date(collateral.asOfDate).toISOString().split('T')[0]
          : '';

        // Convert collateral items to form format
        const collateralItems = Array.isArray(collateral.collateralItems) && collateral.collateralItems.length > 0
          ? collateral.collateralItems.map(item => ({
            description: item.description || '',
            value: item.value || '',
          }))
          : [{ description: '', value: '' }];

        // Pre-populate the form
        $loanCollateralForm.update({
          asOfDate,
          collateralItems,
          notes: collateral.notes || '',
        });

        // If there's an existing document, show it
        if (collateral.documentName) {
          $collateralModalState.update({
            uploadedDocument: {
              fileName: collateral.documentName,
              fileSize: 0,
              mimeType: '',
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to load existing collateral:', error);
      // If loading fails, reset to empty form
      $loanCollateralForm.reset();
    }
  } else {
    // Reset form for new submission
    $loanCollateralForm.reset();
  }
};

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
  $collateralDocUploader.update({ collateralDoc: [] });

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
  const files = $collateralDocUploader.value.collateralDoc;

  if (!files || files.length === 0) return;

  const file = files[0]; // Take the first file

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
  $collateralDocUploader.update({ collateralDoc: [] });
};

/**
 * Handles downloading the uploaded document
 */
export const handleDownloadDocument = () => {
  const { uploadedDocument, documentPreviewUrl } = $collateralModalState.value;
  
  if (!uploadedDocument) return;

  // Create a temporary link element and trigger download
  const link = document.createElement('a');
  link.href = documentPreviewUrl;
  link.download = uploadedDocument.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    const { currentLoanId, isEditMode, editingCollateralId } = $loanCollateralView.value;
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

    // Submit to API (create or update)
    let response;
    if (isEditMode && editingCollateralId) {
      response = await loanCollateralValueApi.update(editingCollateralId, data);
    } else {
      response = await loanCollateralValueApi.create(data);
    }

    if (!response.success) {
      throw new Error(response.error || `Failed to ${isEditMode ? 'update' : 'submit'} collateral value`);
    }

    // Success
    successAlert(`Collateral value ${isEditMode ? 'updated' : 'submitted'} successfully!`);

    // Trigger refresh
    $loanCollateralView.update({
      refreshTrigger: $loanCollateralView.value.refreshTrigger + 1,
    });

    // Refresh loan detail to get updated WATCH score
    // The backend recomputes the WATCH score asynchronously after collateral submission
    if ($loan.value?.loan?.id === currentLoanId) {
      // Refresh immediately to get any cached updates
      fetchLoanDetail(currentLoanId);

      // Refresh again after a short delay to ensure we get the recomputed WATCH score
      // The backend processes the WATCH score computation asynchronously
      setTimeout(() => {
        fetchLoanDetail(currentLoanId);
      }, 2000);
    }

    handleClose();
  } catch (error) {
    console.error(`Error ${$loanCollateralView.value.isEditMode ? 'updating' : 'submitting'} collateral value:`, error);
    $collateralModalState.update({
      error: error.message || `An error occurred while ${$loanCollateralView.value.isEditMode ? 'updating' : 'submitting'}`,
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
