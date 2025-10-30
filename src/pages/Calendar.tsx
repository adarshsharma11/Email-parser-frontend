import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { bookingService, Booking } from "../services/bookingService";
import { useApi } from "../hooks/useApi";
import { useAppContext } from "../context/AppContext";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    booking?: Booking;
    isBooking?: boolean;
  };
}

const Calendar: React.FC = () => {
  const { platform } = useAppContext();
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const { data: response, loading, error, execute: fetchBookings } = useApi(() => bookingService.getBookings(1, 10 ,platform));

  // Extract bookings from the API response
  const bookings = response?.data?.bookings || [];

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  // Helper function to get booking color based on platform
  const getBookingColor = (booking: Booking): string => {
    // Color coding based on platform (case-insensitive)
    const platformColors: { [key: string]: string } = {
      'airbnb': '#FF5A5F',
      'booking.com': '#003580',
      'vrbo': '#0067B8',
      'direct': '#10B981',
      'default': '#3B82F6'
    };
    
    return platformColors[booking.platform.toLowerCase()] || platformColors['default'];
  };

  useEffect(() => {
    // Fetch bookings when component mounts
    console.log('Calendar component mounted, fetching bookings...');
    fetchBookings();
  }, []);

  // Log the booking data when it changes
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      console.log('📊 Calendar Bookings Data:', bookings);
      console.log('📈 Total Calendar Bookings:', bookings.length);
      console.log('🎯 First Calendar Booking Sample:', bookings[0]);
      console.log('📋 Calendar Response Structure:', response);
    }
  }, [bookings, response]);

  // Log loading and error states
  useEffect(() => {
    if (loading) {
      console.log('⏳ Loading calendar bookings...');
    }
    if (error) {
      console.error('❌ Error loading calendar bookings:', error);
      console.error('📍 Error Details:', error.message);
    }
  }, [loading, error]);

  useEffect(() => {
    // Convert bookings to calendar events when bookings data changes
    if (bookings && bookings.length > 0) {
      console.log('🔄 Converting bookings to calendar events...');
      console.log('📅 Number of bookings to convert:', bookings.length);
      
      const bookingEvents: CalendarEvent[] = bookings.map((booking: Booking) => {
        console.log('📝 Processing booking:', booking.reservation_id, booking.platform, booking.guest_name);
        const event = {
          id: booking.reservation_id,
          title: `${booking.guest_name} - ${booking.property_name}`,
          start: booking.check_in_date,
          end: booking.check_out_date,
          allDay: true,
          backgroundColor: getBookingColor(booking),
          borderColor: getBookingColor(booking),
          textColor: '#ffffff',
          extendedProps: {
            calendar: 'Booking',
            booking: booking,
            isBooking: true,
          },
        };
        console.log('🎯 Created event:', event);
        return event;
      });
      
      console.log('✅ Total events created:', bookingEvents.length);
      console.log('📊 Events array:', bookingEvents);
      setEvents(bookingEvents);
    } else {
      console.log('ℹ️ No bookings found or bookings array is empty');
      setEvents([]);
    }
  }, [bookings]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Check if selected dates overlap with any bookings
    const selectedStart = new Date(selectInfo.startStr);
    const selectedEnd = new Date(selectInfo.endStr || selectInfo.startStr);
    
    const hasBookingConflict = events.some(event => {
      if (!event.extendedProps.isBooking) return false;
      
      const bookingStart = new Date(event.start as string);
      const bookingEnd = new Date(event.end as string || event.start as string);
      
      // Check for date overlap
      return (selectedStart <= bookingEnd && selectedEnd >= bookingStart);
    });
    
    if (hasBookingConflict) {
      // Show alert or handle conflict
      alert('This date range conflicts with existing bookings. Please select different dates.');
      return;
    }
    
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const calendarEvent = event as unknown as CalendarEvent;
    setSelectedEvent(calendarEvent);
    
    // If it's a booking event, pre-fill with booking details
    if (calendarEvent.extendedProps.isBooking && calendarEvent.extendedProps.booking) {
      const booking = calendarEvent.extendedProps.booking;
      setEventTitle(`${booking.guest_name} - ${booking.property_name}`);
      setEventStartDate(booking.check_in_date);
      setEventEndDate(booking.check_out_date);
      setEventLevel('Booking');
    } else {
      // Regular event handling
      setEventTitle(event.title);
      setEventStartDate(event.start?.toISOString().split("T")[0] || "");
      setEventEndDate(event.end?.toISOString().split("T")[0] || "");
      setEventLevel(event.extendedProps.calendar);
    }
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel },
              }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
       
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bookings...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-t-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 dark:text-red-300">Failed to load bookings: {error.message}</span>
            </div>
            <button 
              onClick={() => fetchBookings()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: openModal,
              },
            }}
          />
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent?.extendedProps.isBooking ? "Booking Details" : (selectedEvent ? "Edit Event" : "Add Event")}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedEvent?.extendedProps.isBooking 
                  ? "View booking information and guest details" 
                  : "Plan your next big moment: schedule or edit an event to stay on track"}
              </p>
            </div>
            
            {/* Booking Details Section */}
            {selectedEvent?.extendedProps.isBooking && selectedEvent.extendedProps.booking && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h6 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Booking Information</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-medium">Guest Name</label>
                    <p className="text-gray-800 dark:text-white">{selectedEvent.extendedProps.booking.guest_name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-medium">Phone</label>
                    <p className="text-gray-800 dark:text-white">{selectedEvent.extendedProps.booking.guest_phone}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-medium">Property</label>
                    <p className="text-gray-800 dark:text-white">{selectedEvent.extendedProps.booking.property_name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-medium">Guests</label>
                    <p className="text-gray-800 dark:text-white">{selectedEvent.extendedProps.booking.number_of_guests || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-medium">Total Amount</label>
                    <p className="text-gray-800 dark:text-white">
                      {selectedEvent.extendedProps.booking.total_amount} {selectedEvent.extendedProps.booking.currency}
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 font-medium">Platform</label>
                    <p className="text-gray-800 dark:text-white">{selectedEvent.extendedProps.booking.platform}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    {selectedEvent?.extendedProps.isBooking ? "Booking Title" : "Event Title"}
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    disabled={selectedEvent?.extendedProps.isBooking}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${
                                  eventLevel === key ? "block" : "hidden"
                                }`}
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  {selectedEvent?.extendedProps.isBooking ? "Check-in Date" : "Enter Start Date"}
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    disabled={selectedEvent?.extendedProps.isBooking}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  {selectedEvent?.extendedProps.isBooking ? "Check-out Date" : "Enter End Date"}
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    disabled={selectedEvent?.extendedProps.isBooking}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              {!selectedEvent?.extendedProps.isBooking && (
                <button
                  onClick={handleAddOrUpdateEvent}
                  type="button"
                  className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {selectedEvent ? "Update Changes" : "Add Event"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const isBooking = eventInfo.event.extendedProps.isBooking;
  const booking = eventInfo.event.extendedProps.booking;
  
  if (isBooking && booking) {
    return (
      <div 
        className="event-fc-color flex fc-event-main p-1 rounded-sm text-white"
        style={{ backgroundColor: eventInfo.event.backgroundColor || '#3B82F6' }}
      >
        <div className="fc-daygrid-event-dot bg-white"></div>
        <div className="fc-event-title text-xs font-medium truncate">
          {booking.guest_name}
        </div>
      </div>
    );
  }
  
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
