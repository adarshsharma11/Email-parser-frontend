import { useState } from 'react';
import { useNavigate } from 'react-router';
import { propertyService, CreatePropertyRequest } from '../../services/propertyService';
import ComponentCard from '../../components/common/ComponentCard';

export default function AddProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CreatePropertyRequest>({
    name: '',
    vrbo_id: '',
    airbnb_id: '',
    booking_id: '',
    status: 'active'
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }
    
    // Name should be at least 2 characters
    if (formData.name.trim().length < 2) {
      newErrors.name = 'Property name must be at least 2 characters';
    }
    
    // VRBO ID validation (optional but should be valid format if provided)
    if (formData.vrbo_id && formData.vrbo_id.length < 3) {
      newErrors.vrbo_id = 'VRBO ID should be at least 3 characters if provided';
    }
    
    // Airbnb ID validation (optional but should be valid format if provided)
    if (formData.airbnb_id && formData.airbnb_id.length < 3) {
      newErrors.airbnb_id = 'Airbnb ID should be at least 3 characters if provided';
    }
    
    // Booking ID validation (optional but should be valid format if provided)
    if (formData.booking_id && formData.booking_id.length < 3) {
      newErrors.booking_id = 'Booking ID should be at least 3 characters if provided';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await propertyService.createProperty(formData);
      
      if (result.success) {
        alert('Property created successfully!');
        navigate('/properties');
      } else {
        alert('Failed to create property. Please try again.');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('An error occurred while creating the property.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset form
  const handleReset = () => {
    setFormData({
      name: '',
      vrbo_id: '',
      airbnb_id: '',
      booking_id: '',
      status: 'active'
    });
    setErrors({});
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Add Property" className="min-h-[600px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="Enter property name"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* VRBO ID */}
          <div>
            <label htmlFor="vrbo_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              VRBO ID (Optional)
            </label>
            <input
              type="text"
              id="vrbo_id"
              name="vrbo_id"
              value={formData.vrbo_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${
                errors.vrbo_id ? 'border-red-500' : ''
              }`}
              placeholder="Enter VRBO ID"
              disabled={loading}
            />
            {errors.vrbo_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vrbo_id}</p>
            )}
          </div>

          {/* Airbnb ID */}
          <div>
            <label htmlFor="airbnb_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Airbnb ID (Optional)
            </label>
            <input
              type="text"
              id="airbnb_id"
              name="airbnb_id"
              value={formData.airbnb_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${
                errors.airbnb_id ? 'border-red-500' : ''
              }`}
              placeholder="Enter Airbnb ID"
              disabled={loading}
            />
            {errors.airbnb_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.airbnb_id}</p>
            )}
          </div>

          {/* Booking ID */}
          <div>
            <label htmlFor="booking_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Booking ID (Optional)
            </label>
            <input
              type="text"
              id="booking_id"
              name="booking_id"
              value={formData.booking_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${
                errors.booking_id ? 'border-red-500' : ''
              }`}
              placeholder="Enter Booking ID"
              disabled={loading}
            />
            {errors.booking_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.booking_id}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
            >
              {loading ? 'Creating...' : 'Create Property'}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
            >
              Reset
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/properties')}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}