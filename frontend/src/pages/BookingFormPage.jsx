import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, resourceAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';

const BookingFormPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      resourceId: location.state?.resourceId || ''
    }
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const selectedResourceId = watch('resourceId');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (selectedResourceId) {
      const resource = resources.find(r => r.id === selectedResourceId);
      setSelectedResource(resource);
    } else {
      setSelectedResource(null);
    }
  }, [selectedResourceId, resources]);

  const fetchResources = async () => {
    try {
      const response = await resourceAPI.getActiveResources();
      setResources(response.data);
    } catch (error) {
      toast.error('Failed to fetch resources');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const bookingData = {
        resourceId: data.resourceId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        attendeesCount: parseInt(data.attendeesCount),
      };

      await bookingAPI.createBooking(bookingData);
      toast.success('Booking request submitted successfully!');
      
      // Reset form
      document.getElementById('booking-form').reset();
      setSelectedResource(null);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Create New Booking
          </h3>
          
          <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Resource Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Select Resource
              </label>
              <select
                {...register('resourceId', { required: 'Resource is required' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Choose a resource...</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location} (Capacity: {resource.capacity})
                  </option>
                ))}
              </select>
              {errors.resourceId && (
                <p className="mt-1 text-sm text-red-600">{errors.resourceId.message}</p>
              )}
            </div>

            {/* Resource Details */}
            {selectedResource && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Resource Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Location:</strong> {selectedResource.location}</p>
                  <p><strong>Capacity:</strong> {selectedResource.capacity} people</p>
                  <p><strong>Available:</strong> {selectedResource.startTime} - {selectedResource.endTime}</p>
                  {selectedResource.description && (
                    <p><strong>Description:</strong> {selectedResource.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                {...register('date', { 
                  required: 'Date is required',
                  min: { value: getToday(), message: 'Date must be today or in the future' }
                })}
                min={getToday()}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  {...register('startTime', { required: 'Start time is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  End Time
                </label>
                <input
                  type="time"
                  {...register('endTime', { required: 'End time is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Purpose
              </label>
              <textarea
                {...register('purpose', { 
                  required: 'Purpose is required',
                  maxLength: { value: 500, message: 'Purpose must not exceed 500 characters' }
                })}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Describe the purpose of your booking..."
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>

            {/* Attendees Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Number of Attendees
              </label>
              <input
                type="number"
                {...register('attendeesCount', { 
                  required: 'Attendees count is required',
                  min: { value: 1, message: 'Must be at least 1 attendee' },
                  max: { value: selectedResource?.capacity || 1000, message: `Cannot exceed resource capacity${selectedResource ? ` (${selectedResource.capacity})` : ''}` }
                })}
                min="1"
                max={selectedResource?.capacity || 1000}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Number of people attending"
              />
              {errors.attendeesCount && (
                <p className="mt-1 text-sm text-red-600">{errors.attendeesCount.message}</p>
              )}
            </div>

            {/* User Info Display */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Booking Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Submit Booking Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingFormPage;
