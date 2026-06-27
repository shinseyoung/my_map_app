import { create } from 'zustand';

const useAppStore = create((set) => ({
  currentUser: null,
  userLocation: {
    latitude: 0,
    longitude: 0,
  },
  filter: {
    radius: 5, // km
    ageRange: { min: 18, max: 60 },
    gender: 'all', // 'all', 'male', 'female'
  },
  activePins: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  
  setUserLocation: (location) => set({ userLocation: location }),
  
  setFilter: (newFilter) => set((state) => ({ 
    filter: { ...state.filter, ...newFilter } 
  })),
  
  setActivePins: (pins) => set({ activePins: pins }),

  logout: () => set({ 
    currentUser: null, 
    activePins: [] 
  }),
}));

export default useAppStore;