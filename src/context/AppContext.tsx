import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Platform = "airbnb" | "vrbo" | "booking" | "plumguide";

interface AppContextType {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  hotelId: string;
  setHotelId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// LocalStorage keys
const STORAGE_KEYS = {
  PLATFORM: 'app-platform',
  HOTEL_ID: 'app-hotel-id'
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage or use defaults
  const [platform, setPlatformState] = useState<Platform>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PLATFORM);
    return (stored as Platform) || "airbnb";
  });
  
  const [hotelId, setHotelIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.HOTEL_ID) || "";
  });

  // Enhanced setters that persist to localStorage
  const setPlatform = (newPlatform: Platform) => {
    setPlatformState(newPlatform);
    localStorage.setItem(STORAGE_KEYS.PLATFORM, newPlatform);
  };

  const setHotelId = (newHotelId: string) => {
    setHotelIdState(newHotelId);
    localStorage.setItem(STORAGE_KEYS.HOTEL_ID, newHotelId);
  };

  // Sync with localStorage on mount (in case of changes from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PLATFORM && e.newValue) {
        setPlatformState(e.newValue as Platform);
      }
      if (e.key === STORAGE_KEYS.HOTEL_ID && e.newValue !== null) {
        setHotelIdState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AppContext.Provider value={{ platform, setPlatform, hotelId, setHotelId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
