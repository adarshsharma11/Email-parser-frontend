import { createContext, useContext, useState, ReactNode } from "react";

type Platform = "airbnb" | "vrbo" | "booking" | "plumguide";

interface AppContextType {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  hotelId: string;
  setHotelId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [platform, setPlatform] = useState<Platform>("airbnb"); // default platform
  const [hotelId, setHotelId] = useState<string>(""); // default none

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
