import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import MainHeader from '../Component/MainHeader';
import MyEventsTable from '../Component/TableData';
import FeedbackPanel from '../Component/FeedbackPanel';
import EventFormModal from '../Component/EventFormModal';
import { ConfirmationModal } from '../Component/ConfirmationModal';
import { StatusModal } from '../Component/StatusModal';
import { approveEvent, rejectEvent } from '../../services/eventService';
import apiClient from '../../services/api';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });
  const [actionToConfirm, setActionToConfirm] = useState(null);

  // Fetch events (pending/revision)
  const fetchEvents = async () => {
    try {
      const res = await apiClient.get('/event');
      setAllEvents((res.data.event || []).filter(e => ['pending', 'revised'].includes(e.status)));
    } catch (err) {
      setAllEvents([]);
    }
  };

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      const res = await apiClient.get('/users');
      setAdmins((res.data.users || []).filter(u => u.role === 'admin'));
    } catch (err) {
      setAdmins([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAdmins();
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

  // Approve event
  const handleApproveEvent = async (eventId) => {
    await approveEvent(eventId);
    await fetchEvents();
  };

  // Reject event
  const handleRejectEvent = async (eventId, feedback) => {
    await rejectEvent(eventId, feedback);
    await fetchEvents();
  };

  // Kick admin
  const handleKickAdmin = async (userId) => {
    await apiClient.delete(`/users/${userId}`);
    await fetchAdmins();
  };

  // Hire admin
  const handleHireAdmin = async (adminData) => {
    await apiClient.post('/auth/register', { ...adminData, role: 'admin' });
    await fetchAdmins();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <MainHeader pageTitle="SUPER ADMIN" />
      <main className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Approval Events */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Approval Events</h2>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mb-4 px-4 py-2 border rounded-lg"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Revised">Revised</option>
          </select>
          <table className="w-full">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Location</th>
                <th>Date</th>
                <th>Speaker</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id}>
                  <td>{event.eventName}</td>
                  <td>{event.location}</td>
                  <td>{event.date}</td>
                  <td>{event.speaker}</td>
                  <td>{event.status}</td>
                  <td>
                    <button onClick={() => handleApproveEvent(event.id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Approve</button>
                    <button onClick={() => handleRejectEvent(event.id, prompt('Alasan penolakan?'))} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Manajemen Admin */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Manajemen Admin</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.firstName} {admin.lastName}</td>
                  <td>{admin.email}</td>
                  <td>
                    <button onClick={() => handleKickAdmin(admin.id)} className="bg-red-500 text-white px-2 py-1 rounded mr-2">Kick</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => handleHireAdmin({ firstName: prompt('Nama depan?'), lastName: prompt('Nama belakang?'), email: prompt('Email?'), password: prompt('Password?'), confirmPassword: prompt('Konfirmasi Password?') })}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mt-4"
          >
            Hire Admin
          </button>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;