import React, { useState, useEffect } from 'react';
import { bookingAPI, resourceAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Clock,
  Calendar,
  Users,
  FileText,
  Check,
  XCircle,
  Filter,
  Search,
  X
} from 'lucide-react';

const BookingDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReject, setSubmittingReject] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    date: '',
    resourceId: ''
  });

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchResources();
  }, []);

  const fetchBookings = async (customFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (customFilters.status) params.status = customFilters.status;
      if (customFilters.date) params.date = customFilters.date;
      if (customFilters.resourceId) params.resourceId = customFilters.resourceId;

      const response = await bookingAPI.getAllBookings(params);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await resourceAPI.getActiveResources();
      setResources(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch resources');
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await bookingAPI.approveBooking(bookingId);
      toast.success('Booking approved successfully');
      fetchBookings();
    } catch (error) {
      console.error('Approve failed:', error);
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleRejectClick = (booking) => {
    setSelectedBooking(booking);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedBooking(null);
    setRejectionReason('');
    setSubmittingReject(false);
  };

  const handleReject = async () => {
    const trimmedReason = rejectionReason.trim();

    if (!selectedBooking?.id) {
      toast.error('No booking selected');
      return;
    }

    if (!trimmedReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setSubmittingReject(true);
      await bookingAPI.rejectBooking(selectedBooking.id, trimmedReason);
      toast.success('Booking rejected successfully');
      closeRejectModal();
      fetchBookings();
    } catch (error) {
      console.error('Reject failed:', error);
      toast.error(error.response?.data?.message || 'Failed to reject booking');
      setSubmittingReject(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchBookings(filters);
  };

  const clearFilters = () => {
    const cleared = {
      status: '',
      date: '',
      resourceId: ''
    };
    setFilters(cleared);
    fetchBookings(cleared);
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and approve booking requests
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="booking-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="booking-status-filter"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="booking-date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="booking-date-filter"
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="booking-resource-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              id="booking-resource-filter"
              name="resourceId"
              value={filters.resourceId}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Resources</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No bookings match your current filters.
          </p>
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
                        <div className="sm:flex sm:flex-wrap">
                          <p className="flex items-center text-sm text-gray-500 sm:mr-6">
                            <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {booking.userName}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:mr-6">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {formatDate(booking.date)}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:mr-6">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {booking.attendeesCount} attendees
                          </p>
                        </div>

                        <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(booking.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClick(booking)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
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

      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={closeRejectModal}
            />

            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Reject Booking
                  </h3>

                  {selectedBooking && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">
                        <strong>Resource:</strong> {selectedBooking.resourceName}<br />
                        <strong>User:</strong> {selectedBooking.userName}<br />
                        <strong>Date:</strong> {formatDate(selectedBooking.date)}<br />
                        <strong>Time:</strong> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      id="rejection-reason"
                      name="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Please provide a reason for rejecting this booking..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={submittingReject}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReject}
                >
                  {submittingReject ? 'Rejecting...' : 'Reject Booking'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDashboardPage;