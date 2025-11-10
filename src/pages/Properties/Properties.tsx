import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PropertiesTable from "../../components/tables/PropertiesTable";
import { propertyService } from "../../services";
import { useApi } from "../../hooks";

export default function Properties() {
  const navigate = useNavigate();
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Use the custom API hook for properties
const [page] = useState(1);
const [limit] = useState(10);

const { data: response, loading, error, execute: fetchProperties } = useApi(
  () => propertyService.getProperties(page, limit)
);
  // Extract properties from the API response
  const properties = response?.data?.data ?? || [];

  // Handle delete property
  const handleDeleteProperty = async () => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        setDeleteLoading(true);
        const result = {
          success: true,
        }
        
        if (result.success) {
          // Refresh the property list after successful deletion
          await fetchProperties();
          alert('Property deleted successfully!');
        } else {
          alert('Failed to delete property. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('An error occurred while deleting the property.');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Fetch property data on component mount
  useEffect(() => {
    fetchProperties().catch((error) => {
      console.error('Failed to fetch properties:', error);
    });
  }, []);



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
              onClick={() => navigate('/properties/add')}
              className="inline-flex items-center px-4 py-2 md:px-6 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Property
            </button>
          </div>
          
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
            loading={loading || deleteLoading} 
            onDelete={handleDeleteProperty} 
          />
        </ComponentCard>
      </div>
    </>
  );
}