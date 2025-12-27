/* eslint-disable no-alert */
import { $reports, $reportsView } from '@src/signals';
import reportsApi from '@src/api/reports.api';

export const handleDeleteReport = async (reportId) => {
  if (window.confirm('Are you sure you want to delete this report?')) {
    await reportsApi.delete(reportId);
    const updatedReportsResponse = await reportsApi.getAll();
    $reports.update({ list: updatedReportsResponse.data || [] });
    if ($reportsView.value.selectedReportId === reportId) {
      $reportsView.update({ selectedReportId: null });
    }
  }
};

export const handleSelectReport = (reportId) => {
  $reportsView.update({ selectedReportId: reportId });
};
