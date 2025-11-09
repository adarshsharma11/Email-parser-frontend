import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { crewService } from "../../services";
import { CreateCrewRequest } from "../../services/crewService";
import { useApi } from "../../hooks";

export default function AddCrew() {
  const navigate = useNavigate();
  
  // Use the custom API hook for creating crews
  const { loading, error: apiError, execute: createCrew } = useApi(crewService.createCrew);
  
  const [formData, setFormData] = useState<CreateCrewRequest>({
    name: "",
    email: "",
    phone: "",
    property_id: "",
    active: true
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      errors.name = "Name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s\-\.'\u00C0-\u024F\u1E00-\u1EFF]+$/.test(formData.name.trim())) {
      errors.name = "Name can only contain letters, spaces, hyphens, dots, and apostrophes";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (formData.email.length > 100) {
      errors.email = "Email must not exceed 100 characters";
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number (digits, spaces, hyphens, parentheses, plus sign)";
    } else if (formData.phone.length < 7) {
      errors.phone = "Phone number must be at least 7 characters";
    } else if (formData.phone.length > 20) {
      errors.phone = "Phone number must not exceed 20 characters";
    }

    // Property ID validation
    if (!formData.property_id.trim()) {
      errors.property_id = "Property ID is required";
    } else if (formData.property_id.length < 1) {
      errors.property_id = "Property ID must be at least 1 character";
    } else if (formData.property_id.length > 50) {
      errors.property_id = "Property ID must not exceed 50 characters";
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.property_id.trim())) {
      errors.property_id = "Property ID can only contain letters, numbers, spaces, hyphens, and underscores";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      console.log('🚀 Submitting crew data:', formData);
      const result = await createCrew(formData);
      
      if (result?.success) {
        console.log('✅ Crew created successfully:', result.data);
        setShowSuccess(true);
        // Navigate back to crews list after showing success message
        setTimeout(() => {
          navigate('/crews');
        }, 2000);
      } else {
        console.error('❌ Failed to create crew:', result?.error);
      }
    } catch (error) {
      console.error('❌ Error creating crew:', error);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.email || formData.phone || formData.property_id) {
      const confirmCancel = window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.');
      if (!confirmCancel) {
        return;
      }
    }
    navigate('/crews');
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      property_id: "",
      active: true
    });
    setValidationErrors({});
    setShowSuccess(false);
  };

  return (
    <>
      <PageMeta
        title="Add Crew Member | TailAdmin - React Admin Dashboard"
        description="Add a new crew member to the system"
      />
      <PageBreadcrumb pageTitle="Add Crew" />
      
      <div className="space-y-6 min-h-screen pb-20 px-4 sm:px-6 lg:px-8">
        <ComponentCard title="Add New Crew Member" className="min-h-[700px] w-full mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Crew Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details below to add a new crew member to the system.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 overflow-visible">
            {showSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600 font-medium">✅ Success!</div>
                <div className="text-green-500 text-sm mt-1">Crew member created successfully. Redirecting...</div>
              </div>
            )}
            
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 font-medium">❌ Error creating crew</div>
                <div className="text-red-500 text-sm mt-1">{apiError.message}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={50}
                  className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter crew member's full name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {formData.name.length}/50 characters
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  maxLength={100}
                  className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter email address"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {formData.email.length}/100 characters
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={20}
                  className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter phone number (e.g., +1 (555) 123-4567)"
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {formData.phone.length}/20 characters
                </div>
              </div>

              {/* Property ID Field */}
              <div>
                <label htmlFor="property_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property ID *
                </label>
                <input
                  type="text"
                  id="property_id"
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleInputChange}
                  maxLength={50}
                  className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    validationErrors.property_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter property ID"
                />
                {validationErrors.property_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.property_id}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {formData.property_id.length}/50 characters
                </div>
              </div>

              {/* Status Field */}
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Crew Member
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-sm md:text-base"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-2 border border-orange-300 dark:border-orange-600 rounded-lg text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors duration-200 text-sm md:text-base"
                disabled={loading}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </div>
                ) : (
                  'Add Crew Member'
                )}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}