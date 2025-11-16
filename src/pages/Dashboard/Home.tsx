import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { useApi } from "../../hooks";
import { bookingService } from "../../services";
import { useAppContext } from "../../context/AppContext";

export default function Home() {
  const { platform } = useAppContext();
  const { data: dashboardRes, execute: fetchDashboard } = useApi(() => bookingService.getDashboardMetrics(platform));

  const metrics = (dashboardRes as any)?.data;
  const monthlySales = metrics?.monthly_sales || [];

  useEffect(() => {
    fetchDashboard();
  }, [platform]);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <EcommerceMetrics key={`metrics-${platform}`} totalBookings={metrics?.total_bookings} uniqueCustomers={metrics?.unique_customers} />

          <MonthlySalesChart key={`sales-${platform}`} data={monthlySales} />
        </div>
      </div>
    </>
  );
}
