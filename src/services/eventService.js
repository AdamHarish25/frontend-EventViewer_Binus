import apiClient from './api';

// Membuat Event baru (hanya admin)
export const createEvent = async (formData) => {
  try {
    // formData harus berupa FormData, bukan object biasa
    const response = await apiClient.post('/event', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Edit Event (hanya admin)
export const editEvent = async (eventId, formData) => {
  try {
    // PATCH /event/:eventId
    const response = await apiClient.patch(`/event/${eventId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete Event (hanya admin)
export const deleteEvent = async (eventId) => {
  try {
    // DELETE /event/:eventId
    const response = await apiClient.delete(`/event/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve Event (hanya super admin)
export const approveEvent = async (eventId) => {
  try {
    // POST /event/:eventId/approve
    const response = await apiClient.post(`/event/${eventId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject Event (hanya super admin)
export const rejectEvent = async (eventId, feedback) => {
  try {
    // POST /event/:eventId/reject
    const response = await apiClient.post(`/event/${eventId}/reject`, { feedback });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
