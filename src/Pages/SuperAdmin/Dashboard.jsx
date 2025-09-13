import React, { useState, useEffect } from 'react';
import MainHeader from '../Component/MainHeader';
import { StatusModal } from '../Component/StatusModal';
import { approveEvent, rejectEvent, getEvents, sendFeedback } from '../../services/eventService';
import apiClient from '../../services/api';

const SuperAdminDashboard = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });

  // State untuk Paginasi
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch events dengan paginasi
  const fetchEvents = async (page = 1) => {
    try {
      const res = await getEvents(page, 10);
      setAllEvents(res.data.data || []);
      setPaginationInfo(res.data.pagination);
      setCurrentPage(res.data.pagination.currentPage);
    } catch (err) {
      console.error("Error fetching events:", err);
      setAllEvents([]);
      setPaginationInfo(null);
    }
  };

  // PENTING: Endpoint `/users/admins` harus dibuat di backend agar ini berfungsi
  const fetchAdmins = async () => {
    try {
      const res = await apiClient.get('/users/admins'); // Endpoint ini perlu dibuat
      setAdmins((res.data.users || []).filter(u => u.role === 'admin'));
    } catch (err) {
      console.error("Gagal mengambil data admin. Pastikan endpoint GET /users/admins sudah ada di backend.");
      setAdmins([]);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
    fetchAdmins();
  }, [currentPage]);

  useEffect(() => {
    let processed = [...allEvents];
    if (statusFilter !== 'All') {
      processed = processed.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      processed = processed.filter(e => (e.eventName && e.eventName.toLowerCase().includes(term)));
    }
    setFilteredEvents(processed);
  }, [searchTerm, statusFilter, allEvents]);
  
  const handlePageChange = (newPage) => {
    if (paginationInfo && newPage > 0 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAction = async (action, successMessage, errorMessage) => {
    try {
      await action();
      setModal({ type: 'status', data: { variant: 'success', title: 'Success!', message: successMessage } });
      fetchEvents(currentPage); // Re-fetch
    } catch (err) {
      setModal({ type: 'status', data: { variant: 'danger', title: 'Error!', message: err.message || errorMessage } });
    }
  };

  const handleApprove = (eventId) => handleAction(
    () => approveEvent(eventId),
    'Event berhasil disetujui.',
    'Gagal menyetujui event.'
  );

  const handleReject = (eventId) => {
    const feedback = prompt('Harap berikan alasan penolakan:');
    if (feedback) {
      handleAction(
        () => rejectEvent(eventId, feedback),
        'Event berhasil ditolak.',
        'Gagal menolak event.'
      );
    }
  };
  
  const handleFeedback = (eventId) => {
    const feedback = prompt('Harap berikan catatan untuk revisi:');
    if (feedback) {
      handleAction(
        () => sendFeedback(eventId, feedback),
        'Feedback revisi berhasil dikirim.',
        'Gagal mengirim feedback.'
      );
    }
  };

  const handleHireAdmin = (adminData) => {
    // Implementasi logika hire admin jika diperlukan
    console.log("Hiring admin:", adminData);
  }
  
  const handleKickAdmin = (adminId) => {
    // Implementasi logika kick admin jika diperlukan
    console.log("Kicking admin:", adminId);
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <MainHeader pageTitle="SUPER ADMIN" />
      <main className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Event Approval</h2>
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-lg"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="revised">Revised</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Event Name</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id}>
                  <td className="p-2">{event.eventName}</td>
                  <td>{event.location}</td>
                  <td>{event.date}</td>
                  <td><span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{event.status}</span></td>
                  <td className="flex gap-2">
                    <button onClick={() => handleApprove(event.id)} className="text-green-500 font-bold">Approve</button>
                    <button onClick={() => handleReject(event.id)} className="text-red-500 font-bold">Reject</button>
                    <button onClick={() => handleFeedback(event.id)} className="text-blue-500 font-bold">Revise</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                Prev
              </button>
              <span>Page {paginationInfo.currentPage} of {paginationInfo.totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginationInfo.totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Admin Management</h2>
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
      <StatusModal
        isOpen={modal.type === 'status'}
        onClose={() => setModal({ type: null, data: null })}
        title={modal.data?.title}
        message={modal.data?.message}
        variant={modal.data?.variant}
      />
    </div>
  );
};

export default SuperAdminDashboard;