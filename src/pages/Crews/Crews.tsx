import { useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CrewTable from "../../components/tables/CrewTable";
import { crewService } from "../../services";
import { useApi } from "../../hooks";

export default function Crews() {
  // Use the custom API hook for crews
  const { data: response, loading, error, execute: fetchCrews } = useApi(() => crewService.getCrews(1, 10));

  // Extract crews from the API response - response contains the API response with data array
  const crews = response?.data || [];

  // Fetch crew data on component mount
  useEffect(() => {
    console.log('🚀 Fetching crew data...');
    fetchCrews().then((result) => {
      console.log('📡 API call result:', result);
      console.log('📡 API call success:', result?.success);
      console.log('📡 API call data:', result?.data);
      
      // Force display of data structure
      if (result?.success && result?.data) {
        console.log('✅ SUCCESS: Data received:', result.data);
        console.log('✅ Data type:', typeof result.data);
        console.log('✅ Is array:', Array.isArray(result.data));
        console.log('✅ Data length:', Array.isArray(result.data) ? result.data.length : 'N/A');
        console.log('✅ First crew item:', result.data[0]);
      } else {
        console.log('❌ FAILED: No data received or request failed');
        console.log('❌ Result:', result);
      }
    }).catch((error) => {
      console.error('❌ API call failed:', error);
    });
  }, []);


  // Log loading and error states
  useEffect(() => {
    if (loading) {
      console.log('⏳ Loading crews...');
    }
    if (error) {
      console.error('❌ Error loading crews:', error);
      console.error('📍 Error Details:', error.message);
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
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium">Error loading crews: {error.message}</div>
              <div className="text-red-500 text-sm mt-1">
                Please check the API connection and CORS settings
              </div>
            </div>
          )}
        
          
          <CrewTable crews={crews} loading={loading} />
        </ComponentCard>
      </div>
    </>
  );
}
