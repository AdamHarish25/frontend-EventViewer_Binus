import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import MainHeader from '../Component/MainHeader';
import MyEventsTable from '../Component/TableData';
import FeedbackPanel from '../Component/FeedbackPanel';
import EventFormModal from '../Component/EventFormModal';
import { ConfirmationModal } from '../Component/ConfirmationModal';
import { StatusModal } from '../Component/StatusModal';
import { createEvent, editEvent, deleteEvent } from '../../services/eventService';
import apiClient from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });
  const [actionToConfirm, setActionToConfirm] = useState(null);

  // Notifikasi
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await apiClient.get('/notification');
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        console.log('Unexpected notifications format:', res.data);

      } else if (Array.isArray(res.data.notifications)) {
        setNotifications(res.data.notifications);
        console.log('Unexpected notifications format:', res.data);
      } else {
        setNotifications([]);
        console.log('Unexpected notifications format:', res.data);
      }
    } catch (err) {
      setNotifications([]);
      setNotifError('Gagal mengambil notifikasi');
      console.error('Error fetching notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // polling tiap 10 detik
    return () => clearInterval(interval);
  }, []);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await apiClient.get('/event');
      setAllEvents(res.data.event || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setAllEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let processed = [...allEvents];
    if (statusFilter !== 'All') {
      processed = processed.filter(e => (e.status.toLowerCase() === statusFilter.toLowerCase()));
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      processed = processed.filter(e => (
        (e.eventName && e.eventName.toLowerCase().includes(term)) ||
        (e.location && e.location.toLowerCase().includes(term)) ||
        (e.date && e.date.toLowerCase().includes(term)) ||
        (e.startTime && e.startTime.toLowerCase().includes(term)) ||
        (e.endTime && e.endTime.toLowerCase().includes(term)) ||
        (e.speaker && e.speaker.toLowerCase().includes(term))
      ));
    }
    setFilteredEvents(processed);
  }, [searchTerm, statusFilter, allEvents]);

  const handleOpenModal = (type, data = null) => setModal({ type, data });
  const handleCloseModal = () => setModal({ type: null, data: null });

  // Edit event (open modal)
  const handleEditEvent = (event) => handleOpenModal('form', event);

  // Delete event
  const handleDeleteClick = (eventId) => {
    setActionToConfirm(() => async () => {
      try {
        await deleteEvent(eventId);
        await fetchEvents();
        handleCloseModal();
        setTimeout(() => handleOpenModal('status', { variant: 'danger', title: 'Deleted!', message: 'Event berhasil dihapus.' }), 100);
      } catch (err) {
        console.error('Error deleting event:', err);
        setTimeout(() => handleOpenModal('status', { variant: 'danger', title: 'Error!', message: 'Gagal menghapus event.' }), 100);
      }
    });
    handleOpenModal('confirm-delete');
  };

  // Save event (create or edit)
  const handleSaveEvent = (formData) => {
    setActionToConfirm(() => async () => {
      try {
        if (modal.data?.id) {
          await editEvent(modal.data.id, formData);
        } else {
          await createEvent(formData);
        }
        await fetchEvents();
        handleCloseModal();
        setTimeout(() => handleOpenModal('status', { variant: 'success', title: 'Success!', message: 'Event berhasil disimpan.' }), 100);
      } catch (err) {
        console.error('Error saving event:', err);
      }
    });
    handleOpenModal('confirm-save');
  };

  // console.log("Notifications:", notifications);

  return (
    <div className="bg-gray-100 min-h-screen">
      <MainHeader pageTitle="ADMIN" />
      <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <input
              type="text"
              placeholder="Search by event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
            />
            <div className="w-full md:w-auto flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border rounded-lg"
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Revision">Revision</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                onClick={() => handleOpenModal('form')}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Create New Event
              </button>
            </div>
          </div>
          <MyEventsTable
            events={filteredEvents}
            onEdit={handleEditEvent}
            onDelete={handleDeleteClick}
          />
        </div>
        <div className="lg:col-span-1">
          {notifLoading ? (
            <div className="bg-white p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
              <span className="text-gray-500">Loading notifications...</span>
            </div>
          ) : notifError ? (
            <div className="bg-white p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
              <span className="text-red-500">{notifError}</span>
            </div>
          ) : (
            <FeedbackPanel
              feedbackList={notifications.map(n => {
                let payload = {};
                try {
                  payload = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload || {};
                } catch {
                  payload = {};
                }
                const typeToStatus = {
                  event_revision: 'REVISION',
                  event_rejected: 'REJECTED',
                  event_approved: 'APPROVED',
                  event_created: 'PENDING',
                };
                const status = typeToStatus[n.notificationType] || 'PENDING';
                const title = payload.eventName || 'Event Notification';
                const message =
                  n.feedback ||
                  `Event "${payload.eventName || ''}" by ${payload.speaker || ''} at ${payload.location || ''} on ${payload.date || ''}`;

                
                return {
                  id: n.id,
                  status,
                  title,
                  message,
                  ...n,
                };
              })}
              onFeedbackClick={(e) => { console.log('Feedback clicked:', e); }}
            />
          )}
        </div>
      </main>
      <EventFormModal
        isOpen={modal.type === 'form'}
        onClose={handleCloseModal}
        eventToEdit={modal.data}
        onSave={handleSaveEvent}
      />
      <ConfirmationModal
        isOpen={modal.type === 'confirm-save'}
        onClose={handleCloseModal}
        onConfirm={actionToConfirm}
        title="Attention!"
        message="Are you sure?"
        variant="success"
      />
      <ConfirmationModal
        isOpen={modal.type === 'confirm-delete'}
        onClose={handleCloseModal}
        onConfirm={actionToConfirm}
        title="Attention!"
        message="This will permanently delete the event."
        variant="danger"
      />
      <StatusModal
        isOpen={modal.type === 'status'}
        onClose={handleCloseModal}
        title={modal.data?.title}
        message={modal.data?.message}
        variant={modal.data?.variant}
      />
    </div>
  );
};

export default AdminDashboard;