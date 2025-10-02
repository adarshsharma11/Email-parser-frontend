import { useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BookingTable from "../../components/tables/BookingTable";
import { bookingService } from "../../services";
import { useApi } from "../../hooks";

export default function Bookings() {
  // Use the custom API hook for bookings
  const { data: response, loading, error, execute: fetchBookings } = useApi(() => bookingService.getBookings(1, 10));

  // Extract bookings from the API response
  const bookings = response?.data?.bookings || [];

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Log the booking data when it changes
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      console.log('📊 Bookings Data:', bookings);
      console.log('📈 Total Bookings:', bookings.length);
      console.log('🎯 First Booking Sample:', bookings[0]);
      console.log('📋 Response Structure:', response);
    }
  }, [bookings, response]);

  // Log loading and error states
  useEffect(() => {
    if (loading) {
      console.log('⏳ Loading bookings...');
    }
    if (error) {
      console.error('❌ Error loading bookings:', error);
      console.error('📍 Error Details:', error.message);
    }
  }, [loading, error]);

  return (
    <>
      <PageMeta
        title="React.js Bookings Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Bookings Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Bookings" />
      <div className="space-y-6">
        <ComponentCard title="Bookings Data">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium">Error loading bookings: {error.message}</div>
              <div className="text-red-500 text-sm mt-1">
                Please check the API connection and CORS settings
              </div>
            </div>
          )}
          
          <BookingTable bookings={bookings} loading={loading} />
        </ComponentCard>
      </div>
    </>
  );
}
