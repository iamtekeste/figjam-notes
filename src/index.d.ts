import { Content } from "@tiptap/core";

type Note = {
  previewText: string;
  content: Content;
  creator: User;
  createdAt: number;
  noteId: string;
  selectedNodeId: string;
};
type Notes = {
  [key: string]: Note;
};

type NotesListProp = {
  addNewNote: () => void | Promise<any>;
  showAllNotes: boolean;
  toggleShowAllNotes: () => void | Promise<any>;
  notes: Note[];
};

type NoteItemProp = {
  noteId: string;
  note: Note;
  key: string;
};
type EmptyStateProp = {
  addNewNote: () => void | Promise<any>;
};
