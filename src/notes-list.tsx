/** @jsx figma.widget.h */

const { widget } = figma;
const { AutoLayout, Text, useSyncedState, SVG, useWidgetId, Frame } = widget;
import { NotesListProp } from ".";
import NoteItem from "./note-item";
import EmptyState from "./empty-state";
import placeholderContent from "./placeholder-content";
const NotesList = ({
  notes,
  addNewNote,
  showAllNotes,
  toggleShowAllNotes,
}: NotesListProp) => {
  let allNotes = notes;
  if(notes.length === 0) {
    allNotes = placeholderContent
  }
  const notesTobeRendered = showAllNotes ? allNotes : allNotes.slice(0, 5);
  const notesList = notesTobeRendered.map((note) => {
    return note.previewText ? (
      <NoteItem noteId={note.noteId} note={note} key={note.noteId}/>
    ) : (
      <Frame width={0.01} height={0.01} hidden></Frame>
    );
  });

  return (
    <AutoLayout
      direction="vertical"
      width="fill-parent"
      height="hug-contents"
      padding={16}
      spacing={16}
      fill={{
        type: "solid",
        color: { r: 1, g: 1, b: 1, a: 0 },
      }}
    >
      {notesList.length === 0 && <EmptyState addNewNote={addNewNote} />}
      {notesList}
      {notes.length > 5 && (
        <Text
          onClick={toggleShowAllNotes}
          fill={{
            type: "solid",
            color: { r: 0, g: 0, b: 0, a: 0.5 },
          }}
        >
          {showAllNotes
            ? "Show less notes"
            : `Show ${notes.length - 5} more notes`}
        </Text>
      )}
    </AutoLayout>
  );
};

export default NotesList;
