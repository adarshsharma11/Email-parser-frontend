import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PropertiesTable from "../../components/tables/PropertiesTable";
import { propertyService } from "../../services";
import type { PropertyApiResponse, CreatePropertyRequest } from "../../services";
import { useApi } from "../../hooks";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Alert from "../../components/ui/alert/Alert";

export default function Properties() {
  
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Alert state for success/error feedback
  const [alertState, setAlertState] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    visible: boolean;
  }>({ variant: "success", title: "", message: "", visible: false });

  // Confirmation modal controls
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal(false);

  // Add Property modal controls
  const {
    isOpen: isAddOpen,
    openModal: openAddModal,
    closeModal: closeAddModal,
  } = useModal(false);

  // (Guest Detail modal removed)

  // Add Property form state
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addForm, setAddForm] = useState<CreatePropertyRequest>({
    name: "",
    vrbo_id: "",
    airbnb_id: "",
    booking_id: "",
    status: "active",
  });
  
  // Use the custom API hook for properties
const [page] = useState(1);
const [limit] = useState(10);

const { data: response, loading, error, execute: fetchProperties } = useApi<PropertyApiResponse>(
  () => propertyService.getProperties(page, limit)
);
  // Extract properties array from the API response shape
  const properties = response?.data ?? [];

  // Open confirmation modal
  const handleDeleteProperty = (propertyId: string) => {
    if (!propertyId) return;
    setSelectedPropertyId(propertyId);
    openDeleteModal();
  };

  // Confirm deletion after modal approval
  const confirmDelete = async () => {
    if (!selectedPropertyId) return;
    try {
      setDeleteLoading(true);
      const result = await propertyService.deleteProperty(selectedPropertyId);

      if (result.success) {
        await fetchProperties();
        setAlertState({
          variant: "success",
          title: "Property deleted",
          message: "The property was deleted successfully.",
          visible: true,
        });
      } else {
        setAlertState({
          variant: "error",
          title: "Delete failed",
          message: "Failed to delete the property. Please try again.",
          visible: true,
        });
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      setAlertState({
        variant: "error",
        title: "Unexpected error",
        message: "An error occurred while deleting the property.",
        visible: true,
      });
    } finally {
      setDeleteLoading(false);
      setSelectedPropertyId(null);
      closeDeleteModal();
    }
  };

  // Fetch property data on component mount
  useEffect(() => {
    fetchProperties().catch((error) => {
      console.error('Failed to fetch properties:', error);
    });
  }, []);

  // Auto-dismiss alerts after a short delay
  useEffect(() => {
    if (!alertState.visible) return;
    const timer = setTimeout(() => {
      setAlertState((prev) => ({ ...prev, visible: false }));
    }, 3500);
    return () => clearTimeout(timer);
  }, [alertState.visible]);



  return (
    <>
      <PageMeta
        title="React.js Properties Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Properties Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Properties" />
      <div className="space-y-6">
        <ComponentCard title="Properties Data">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Properties</h3>
            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center px-4 py-2 md:px-6 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Property
            </button>
          </div>

          {alertState.visible && (
            <div className="mb-4">
              <Alert
                variant={alertState.variant}
                title={alertState.title}
                message={alertState.message}
              />
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium">Error loading properties: {error.message}</div>
              <div className="text-red-500 text-sm mt-1">
                Please check the API connection and CORS settings
              </div>
            </div>
          )}
        
          <PropertiesTable 
            properties={properties} 
            loading={loading || deleteLoading || createLoading} 
            onDelete={handleDeleteProperty}
          />

          {/* Delete Confirmation Modal */}
          <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="max-w-md p-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Confirm deletion</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </Modal>

          {/* Add Property Modal */}
          <Modal isOpen={isAddOpen} onClose={closeAddModal} className="max-w-2xl p-6">
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Add Property</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  // Validate
                  const errs: Record<string, string> = {};
                  if (!addForm.name.trim()) {
                    errs.name = 'Property name is required';
                  } else if (addForm.name.trim().length < 2) {
                    errs.name = 'Property name must be at least 2 characters';
                  }
                  if (addForm.vrbo_id && addForm.vrbo_id.length < 3) {
                    errs.vrbo_id = 'VRBO ID should be at least 3 characters if provided';
                  }
                  if (addForm.airbnb_id && addForm.airbnb_id.length < 3) {
                    errs.airbnb_id = 'Airbnb ID should be at least 3 characters if provided';
                  }
                  if (addForm.booking_id && addForm.booking_id.length < 3) {
                    errs.booking_id = 'Booking ID should be at least 3 characters if provided';
                  }
                  setAddErrors(errs);
                  if (Object.keys(errs).length > 0) return;

                  // Submit
                  try {
                    setCreateLoading(true);
                    const result = await propertyService.createProperty(addForm);
                    if (result.success) {
                      await fetchProperties();
                      setAlertState({
                        variant: 'success',
                        title: 'Property created',
                        message: 'The property was created successfully.',
                        visible: true,
                      });
                      // Reset and close
                      setAddForm({ name: '', vrbo_id: '', airbnb_id: '', booking_id: '', status: 'active' });
                      setAddErrors({});
                      closeAddModal();
                    } else {
                      setAlertState({
                        variant: 'error',
                        title: 'Create failed',
                        message: 'Failed to create the property. Please try again.',
                        visible: true,
                      });
                    }
                  } catch (err) {
                    console.error('Error creating property:', err);
                    setAlertState({
                      variant: 'error',
                      title: 'Unexpected error',
                      message: 'An error occurred while creating the property.',
                      visible: true,
                    });
                  } finally {
                    setCreateLoading(false);
                  }
                }}
                className="space-y-6"
              >
                {/* Property Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={addForm.name}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setAddForm((prev) => ({ ...prev, [name]: value }));
                      if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: '' }));
                    }}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${addErrors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter property name"
                    disabled={createLoading}
                  />
                  {addErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{addErrors.name}</p>
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
                    value={addForm.vrbo_id}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setAddForm((prev) => ({ ...prev, [name]: value }));
                      if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: '' }));
                    }}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${addErrors.vrbo_id ? 'border-red-500' : ''}`}
                    placeholder="Enter VRBO ID"
                    disabled={createLoading}
                  />
                  {addErrors.vrbo_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{addErrors.vrbo_id}</p>
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
                    value={addForm.airbnb_id}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setAddForm((prev) => ({ ...prev, [name]: value }));
                      if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: '' }));
                    }}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${addErrors.airbnb_id ? 'border-red-500' : ''}`}
                    placeholder="Enter Airbnb ID"
                    disabled={createLoading}
                  />
                  {addErrors.airbnb_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{addErrors.airbnb_id}</p>
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
                    value={addForm.booking_id}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setAddForm((prev) => ({ ...prev, [name]: value }));
                      if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: '' }));
                    }}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base ${addErrors.booking_id ? 'border-red-500' : ''}`}
                    placeholder="Enter Booking ID"
                    disabled={createLoading}
                  />
                  {addErrors.booking_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{addErrors.booking_id}</p>
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
                    value={addForm.status}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setAddForm((prev) => ({ ...prev, [name]: value as CreatePropertyRequest['status'] }));
                    }}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base"
                    disabled={createLoading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
                  >
                    {createLoading ? 'Creating…' : 'Create Property'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddForm({ name: '', vrbo_id: '', airbnb_id: '', booking_id: '', status: 'active' });
                      setAddErrors({});
                    }}
                    disabled={createLoading}
                    className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    disabled={createLoading}
                    className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Guest Detail Modal removed from Properties page */}
        </ComponentCard>
      </div>
    </>
  );
}