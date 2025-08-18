// src/Pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import MainHeader from '../Component/MainHeader';
import MyEventsTable from '../Component/TableData';
import FeedbackPanel from '../Component/FeedbackPanel';
import EventFormModal from '../Component/EventFormModal';
import { ConfirmationModal } from '../Component/ConfirmationModal'; // Sesuaikan jika filenya terpisah
import {StatusModal} from '../Component/StatusModal';
import { mockEvents, mockFeedback } from '../data/mockdata';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });
  const [actionToConfirm, setActionToConfirm] = useState(null);

  useEffect(() => {
    if (user) {
      const userEvents = mockEvents.filter(e => e.authorId === user.id);
      const userFeedback = mockFeedback.filter(f => userEvents.some(e => e.feedbackId === f.id));
      setAllEvents(userEvents);
      setFeedback(userFeedback);
    }
  }, [user]);

  useEffect(() => {
    let processed = [...allEvents];
    if (statusFilter !== 'All') {
      processed = processed.filter(e => e.status === statusFilter);
    }
    if (searchTerm.trim() !== '') {
      processed = processed.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredEvents(processed);
  }, [searchTerm, statusFilter, allEvents]);

  const handleOpenModal = (type, data = null) => setModal({ type, data });
  const handleCloseModal = () => setModal({ type: null, data: null });
  const handleEditEvent = (event) => handleOpenModal('form', event);

  const handleDeleteClick = (id) => {
    setActionToConfirm(() => () => {
      setAllEvents(p => p.filter(e => e.id !== id));
      handleCloseModal();
      setTimeout(() => handleOpenModal('status', { variant: 'danger', title: 'Deleted!', message: 'Event has been successfully deleted.' }), 100);
    });
    handleOpenModal('confirm-delete');
  };

  const handleNotifyClick = (feedbackId) => {
    const data = mockFeedback.find(f => f.id === feedbackId);
    if (data) handleOpenModal('feedback', data); // Anda perlu membuat FeedbackModal atau menggunakan modal generik
  };
  
  const handleSaveEvent = (formData) => {
    setActionToConfirm(() => () => {
      const isEditing = modal.data?.id;
      if (isEditing) {
        setAllEvents(p => p.map(e => (e.id === modal.data.id ? { ...e, ...formData, date: `${formData.date} - ${formData.time}` } : e)));
      } else {
        const newEvent = { id: Date.now(), authorId: user.id, status: 'Pending', feedbackId: null, ...formData, date: `${formData.date} - ${formData.time}` };
        setAllEvents(p => [newEvent, ...p]);
      }
      handleCloseModal();
      setTimeout(() => handleOpenModal('status', { variant: 'success', title: 'Success!', message: 'Your event has been successfully submitted.' }), 100);
    });
    handleOpenModal('confirm-save');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <MainHeader pageTitle="ADMIN" />
      <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <input type="text" placeholder="Search by event name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/2 px-4 py-2 border rounded-lg"/>
            <div className="w-full md:w-auto flex items-center gap-4">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-auto px-4 py-2 border rounded-lg">
                <option value="All">All Status</option>
                <option value="Accepted">Accepted</option><option value="Pending">Pending</option><option value="Revision">Revision</option><option value="Rejected">Rejected</option>
              </select>
              <button onClick={() => handleOpenModal('form')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Create New Event</button>
            </div>
          </div>
          <MyEventsTable events={filteredEvents} onEdit={handleEditEvent} onDelete={handleDeleteClick} onNotify={handleNotifyClick} />
        </div>
        <div className="lg:col-span-1">
          <FeedbackPanel feedbackList={feedback} onFeedbackClick={handleNotifyClick} />
        </div>
      </main>
      <EventFormModal isOpen={modal.type === 'form'} onClose={handleCloseModal} eventToEdit={modal.data} onSave={handleSaveEvent} />
      <ConfirmationModal isOpen={modal.type === 'confirm-save'} onClose={handleCloseModal} onConfirm={actionToConfirm} title="Attention!" message="Are you sure?" variant="success" />
      <ConfirmationModal isOpen={modal.type === 'confirm-delete'} onClose={handleCloseModal} onConfirm={actionToConfirm} title="Attention!" message="This will permanently delete the event." variant="danger" />
      <StatusModal isOpen={modal.type === 'status'} onClose={handleCloseModal} title={modal.data?.title} message={modal.data?.message} variant={modal.data?.variant} />
    </div>
  );
};
export default AdminDashboard;