import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CrewTable from "../../components/tables/CrewTable";
import { crewService } from "../../services";
import { useApi } from "../../hooks";

export default function Crews() {
  const navigate = useNavigate();
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Use the custom API hook for crews
  const { data: response, loading, error, execute: fetchCrews } = useApi(() => crewService.getCrews(1, 10));

  // Extract crews from the API response - response contains the crews data directly
  const crews = response?.data || [];

  // Handle delete crew member
  const handleDeleteCrew = async (crewId: string) => {
    if (confirm('Are you sure you want to delete this crew member? This action cannot be undone.')) {
      try {
        setDeleteLoading(true);
        const result = await crewService.deleteCrew(crewId);
        
        if (result.success) {
          // Refresh the crew list after successful deletion
          await fetchCrews();
          alert('Crew member deleted successfully!');
        } else {
          alert('Failed to delete crew member. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting crew member:', error);
        alert('An error occurred while deleting the crew member.');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Fetch crew data on component mount
  useEffect(() => {
    fetchCrews().then(() => {
    }).catch(() => {
    });
  }, []);


  // Log loading and error states
  useEffect(() => {
    if (loading) {
    }
    if (error) {
    }
  }, [loading, error]);

  return (
    <>
      <PageMeta
        title="React.js Crews Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Crews Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Crews" />
      <div className="space-y-6">
        <ComponentCard title="Crews Data">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Crew Members</h3>
            <button
              onClick={() => navigate('/crews/add')}
               className="inline-flex items-center px-4 py-2 md:px-6 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm md:text-base font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Crew
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium">Error loading crews: {error.message}</div>
              <div className="text-red-500 text-sm mt-1">
                Please check the API connection and CORS settings
              </div>
            </div>
          )}
        
          
          <CrewTable crews={crews} loading={loading} onDelete={handleDeleteCrew} deleteLoading={deleteLoading} />
        </ComponentCard>
      </div>
    </>
  );
}
