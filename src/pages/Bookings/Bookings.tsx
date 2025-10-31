import { useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BookingTable from "../../components/tables/BookingTable";
import { bookingService } from "../../services";
import { useApi } from "../../hooks";
import { useAppContext } from "../../context/AppContext";

export default function Bookings() {
  const { platform } = useAppContext();

  // Custom API hook
  const { data: response, loading, error, execute: fetchBookings } = useApi(() =>
    bookingService.getBookings(1, 10, platform)
  );

  const bookings = response?.data?.bookings || [];

  useEffect(() => {
    if (platform) {
      fetchBookings();
    }
  }, [platform]);

  return (
    <>
      <PageMeta
        title="Bookings Dashboard"
        description="React.js Bookings Dashboard Page"
      />
      <PageBreadcrumb pageTitle="Bookings" />
      <div className="space-y-6">
        <ComponentCard title={`Bookings (${platform})`}>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium">
                Error loading bookings: {error.message}
              </div>
            </div>
          )}
          <BookingTable bookings={bookings} loading={loading} />
        </ComponentCard>
      </div>
    </>
  );
}
