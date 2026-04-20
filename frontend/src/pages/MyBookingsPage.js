import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  X, 
  Check, 
  XCircle,
  QrCode,
  Eye
} from 'lucide-react';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState('');

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchMyBookings();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(errorMessage);
    }
  };

  const handleShowQRCode = (qrCodeBase64) => {
    setSelectedQRCode(qrCodeBase64);
    setShowQRModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-4 w-4" />,
        text: 'Pending'
      },
      APPROVED: {
        color: 'bg-green-100 text-green-800',
        icon: <Check className="h-4 w-4" />,
        text: 'Approved'
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="h-4 w-4" />,
        text: 'Rejected'
      },
      CANCELLED: {
        color: 'bg-gray-100 text-gray-800',
        icon: <X className="h-4 w-4" />,
        text: 'Cancelled'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your booking requests
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't made any booking requests yet.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Booking
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {booking.resourceName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.resourceLocation}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                      
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {formatDate(booking.date)}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {booking.attendeesCount} attendees
                          </p>
                        </div>
                        <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                          {booking.status === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => handleShowQRCode(booking.qrCodeBase64)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <QrCode className="h-4 w-4 mr-1" />
                                QR Code
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {booking.purpose && (
                        <div className="mt-2">
                          <p className="flex items-start text-sm text-gray-500">
                            <FileText className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 mt-0.5" />
                            <span className="truncate">{booking.purpose}</span>
                          </p>
                        </div>
                      )}
                      
                      {booking.rejectionReason && (
                        <div className="mt-2">
                          <p className="text-sm text-red-600">
                            <strong>Reason:</strong> {booking.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Booking QR Code
                    </h3>
                    
                    {selectedQRCode ? (
                      <div className="text-center">
                        <img 
                          src={`data:image/png;base64,${selectedQRCode}`}
                          alt="Booking QR Code"
                          className="mx-auto mb-4"
                        />
                        <p className="text-sm text-gray-600">
                          Show this QR code at the resource location for verification.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p>QR code not available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowQRModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
