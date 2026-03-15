import { getApiBaseUrl } from './apiClient';
import { getAccessToken } from './authStorage';

export async function downloadOwnerReport(params?: {
  from?: string;
  to?: string;
  parkingLotId?: string;
}) {
  const token = getAccessToken();
  const API_BASE_URL = getApiBaseUrl();

  const query = new URLSearchParams();

  if (params?.from) query.append('from', params.from);
  if (params?.to) query.append('to', params.to);
  if (params?.parkingLotId) query.append('parkingLotId', params.parkingLotId);

  const response = await fetch(
    `${API_BASE_URL}/owner/analytics/report?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  const blob = await response.blob();

  const contentDisposition = response.headers.get('content-disposition');

  let fileName = 'parksmart-owner-report.pdf';

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export async function downloadOwnerReportCsv(params?: {
  from?: string;
  to?: string;
  parkingLotId?: string;
}) {
  const token = getAccessToken();
  const API_BASE_URL = getApiBaseUrl();

  const query = new URLSearchParams();

  if (params?.from) query.append('from', params.from);
  if (params?.to) query.append('to', params.to);
  if (params?.parkingLotId) query.append('parkingLotId', params.parkingLotId);

  const response = await fetch(
    `${API_BASE_URL}/owner/analytics/report.csv?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to download CSV report');
  }

  const blob = await response.blob();

  const contentDisposition = response.headers.get('content-disposition');

  let fileName = 'parksmart-owner-report.csv';

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}