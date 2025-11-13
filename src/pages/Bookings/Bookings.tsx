import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BookingTable from "../../components/tables/BookingTable";
import { bookingService } from "../../services";
import { useApi } from "../../hooks";
import { useAppContext } from "../../context/AppContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Alert from "../../components/ui/alert/Alert";

export default function Bookings() {
  const { platform } = useAppContext();

  // Custom API hook
  const { data: response, loading, error, execute: fetchBookings } = useApi(() =>
    bookingService.getBookings(1, 10, platform)
  );

  const bookings = response?.data?.bookings || [];

  // Guest modal state
  const [selectedBookingForGuest, setSelectedBookingForGuest] = useState<{ id: string; name: string } | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [updatingGuest, setUpdatingGuest] = useState(false);

  // Alerts
  const [alertState, setAlertState] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    visible: boolean;
  }>({ variant: "success", title: "", message: "", visible: false });

  // Guest Detail modal controls
  const {
    isOpen: isGuestOpen,
    openModal: openGuestModal,
    closeModal: closeGuestModal,
  } = useModal(false);

  useEffect(() => {
    if (platform) {
      fetchBookings();
    }
  }, [platform]);

  // Auto-dismiss alerts
  useEffect(() => {
    if (!alertState.visible) return;
    const t = setTimeout(() => setAlertState((p) => ({ ...p, visible: false })), 3500);
    return () => clearTimeout(t);
  }, [alertState.visible]);

  return (
    <>
      <PageMeta
        title="Bookings Dashboard"
        description="React.js Bookings Dashboard Page"
      />
      <PageBreadcrumb pageTitle="Bookings" />
      <div className="space-y-6">
        <ComponentCard title={`Bookings (${platform})`}>
          {alertState.visible && (
            <div className="mb-4">
              <Alert variant={alertState.variant} title={alertState.title} message={alertState.message} />
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 font-medium">
                Error loading bookings: {error.message}
              </div>
            </div>
          )}
          <BookingTable
            bookings={bookings}
            loading={loading}
            onAddGuest={(b) => {
              setSelectedBookingForGuest({ id: b.reservation_id, name: b.guest_name });
              setGuestName(b.guest_name || "");
              setGuestPhone(b.guest_phone || "");
              openGuestModal();
            }}
          />

          {/* Guest Detail Modal */}
          <Modal isOpen={isGuestOpen} onClose={closeGuestModal} className="max-w-md p-6">
            <div className="space-y-5">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Guest Detail</h4>
              {selectedBookingForGuest && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  For reservation: <span className="font-medium text-gray-800 dark:text-white">{selectedBookingForGuest.id}</span>
                </div>
              )}
              <div>
                <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guest Name
                </label>
                <input
                  id="guest_name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  disabled
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-100 dark:text-gray-700 dark:opacity-80 text-sm md:text-base cursor-not-allowed"
                  placeholder="Guest name (view only)"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Auto-filled from booking. Name is not editable.</p>
              </div>
              <div>
                <label htmlFor="guest_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  id="guest_phone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm md:text-base"
                  placeholder="e.g., (555) 123-4567"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={async () => {
                    const phoneOk = guestPhone.trim().length >= 7;
                    if (!phoneOk) {
                      setAlertState({ variant: 'warning', title: 'Invalid phone', message: 'Please enter a valid phone number.', visible: true });
                      return;
                    }
                    try {
                      setUpdatingGuest(true);
                      const res = await bookingService.updateGuestPhone(String(selectedBookingForGuest?.id), { guest_phone: guestPhone });
                      if (res.success) {
                        setAlertState({ variant: 'success', title: 'Phone updated', message: 'Guest phone number updated successfully.', visible: true });
                        await fetchBookings();
                        closeGuestModal();
                        setSelectedBookingForGuest(null);
                        setGuestName('');
                        setGuestPhone('');
                      } else {
                        setAlertState({ variant: 'error', title: 'Update failed', message: res.error || 'Failed to update phone number.', visible: true });
                      }
                    } catch (err) {
                      console.error(err);
                      setAlertState({ variant: 'error', title: 'Unexpected error', message: 'An error occurred while updating phone number.', visible: true });
                    } finally {
                      setUpdatingGuest(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                  disabled={updatingGuest}
                >
                  {updatingGuest ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={async () => {
                    const phoneOk = guestPhone.trim().length >= 7;
                    if (!phoneOk) {
                      setAlertState({ variant: 'warning', title: 'Invalid phone', message: 'Please enter a valid phone number.', visible: true });
                      return;
                    }
                    try {
                      setUpdatingGuest(true);
                      const res = await bookingService.updateGuestPhone(String(selectedBookingForGuest?.id), { guest_phone: guestPhone });
                      if (res.success) {
                        setAlertState({ variant: 'success', title: 'Phone updated & notified', message: 'Phone updated and notification sent.', visible: true });
                        await fetchBookings();
                        closeGuestModal();
                        setSelectedBookingForGuest(null);
                        setGuestName('');
                        setGuestPhone('');
                      } else {
                        setAlertState({ variant: 'error', title: 'Update failed', message: res.error || 'Failed to update phone number.', visible: true });
                      }
                    } catch (err) {
                      console.error(err);
                      setAlertState({ variant: 'error', title: 'Unexpected error', message: 'An error occurred while updating phone number.', visible: true });
                    } finally {
                      setUpdatingGuest(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={updatingGuest}
                >
                  {updatingGuest ? 'Saving…' : 'Save & Notify'}
                </button>
              </div>
            </div>
          </Modal>
        </ComponentCard>
      </div>
    </>
  );
}
