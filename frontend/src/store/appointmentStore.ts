import { create } from "zustand";
import { Service } from "../types";

interface AppointmentStore {
  selectedService: Service | null;
  selectedDate: string;
  selectedTime: string;
  notes: string;
  setSelectedService: (service: Service) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  selectedService: null,
  selectedDate: "",
  selectedTime: "",
  notes: "",
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setNotes: (notes) => set({ notes }),
  reset: () => set({ selectedService: null, selectedDate: "", selectedTime: "", notes: "" }),
}));
