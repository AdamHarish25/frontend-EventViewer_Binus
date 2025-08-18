// src/components/FeedbackPanel.jsx
import React from 'react';
import { FaBell, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const statusIcons = {
  REVISION: <FaExclamationTriangle className="text-yellow-500" />,
  REJECTED: <FaTimesCircle className="text-red-500" />,
  APPROVED: <FaCheckCircle className="text-green-500" />,
  PENDING: <FaClock className="text-blue-500" />,
};

const FeedbackPanel = ({ feedbackList, onFeedbackClick }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Notifications</h2>
      <div className="space-y-4">
        {feedbackList.length > 0 ? (
          feedbackList.map(item => (
            <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => onFeedbackClick(item)}>
              <div className="mt-1">{statusIcons[item.status] || <FaBell />}</div>
              <div>
                <h3 className="font-semibold text-gray-700">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.message.substring(0, 50)}...</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">No notifications.</p>
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;