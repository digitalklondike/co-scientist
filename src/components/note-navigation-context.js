import { createContext, useContext } from "react";

export const NoteNavigation = createContext(null);

export function useNoteNavigation() {
  return useContext(NoteNavigation).request;
}
