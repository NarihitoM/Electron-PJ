import { create } from "zustand";

interface MemoryState {
  editingId: string | null;
  editingContent: string;
  newMemoryContent: string;
  setEditingId: (id: string | null) => void;
  setEditingContent: (value: string) => void;
  setNewMemoryContent: (value: string) => void;
  resetEditing: () => void;
}

export const memorystore = create<MemoryState>((set) => ({
  editingId: null,
  editingContent: "",
  newMemoryContent: "",
  setEditingId: (id) => set({ editingId: id }),
  setEditingContent: (value) => set({ editingContent: value }),
  setNewMemoryContent: (value) => set({ newMemoryContent: value }),
  resetEditing: () => set({ editingId: null, editingContent: "" }),
}));
