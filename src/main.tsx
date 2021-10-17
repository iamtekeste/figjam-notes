/** @jsx figma.widget.h */

import { showUI, emit, on } from "@create-figma-plugin/utilities";
import { Note } from ".";
const { widget } = figma;
const { AutoLayout, Text, useSyncedMap, SVG, useWidgetId, useSyncedState } =
  widget;
import NotesList from "./notes-list";
export default function () {
  widget.register(NotePad);
}

const newNoteIcon = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="14" cy="14" r="14" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 6C13.4477 6 13 6.44772 13 7V13H7C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15H13V21C13 21.5523 13.4477 22 14 22C14.5523 22 15 21.5523 15 21V15H21C21.5523 15 22 14.5523 22 14C22 13.4477 21.5523 13 21 13H15V7C15 6.44772 14.5523 6 14 6Z" fill="black"/>
</svg>
`;

function NotePad() {
  const thisWidgetId = useWidgetId();

  const notes = useSyncedMap<Note>("all-notes");
  const [showAllNotes, setShowAllNotes] = useSyncedState(
    "show-all-notes",
    false
  );

  on("NOTE-UPDATED", (note: Note) => {
    const { noteId } = note;
    const newNotes = { ...notes };
    notes.delete(noteId);
    if (!note.previewText) {
      return;
    } else {
      // the note has some content so add it back in
      notes.set(noteId, note);
    }
  });
  on("CLOSE_PLUGIN", () => {
    figma.closePlugin();
  });
  on("DELETE_NOTE", (noteTobeDeleted) => {
    notes.delete(noteTobeDeleted);
    figma.notify("Note Deleted.");
    figma.closePlugin();
  });

  const addNewNote = async (): Promise<void> => {
    if (!figma.currentUser) return;
    const thisWidget = figma.getNodeById(thisWidgetId) as WidgetNode;
    const iframePosition = {
      x: thisWidget.width + 16 + thisWidget.x,
      y: thisWidget.y,
    };
    return new Promise((resolve) => {
      showUI({
        height: 350,
        width: 350,
        position: iframePosition,
      });
      const newNote = {
        currentUser: figma.currentUser as User,
        selectedNodeId:
          figma.currentPage.selection[0] &&
          figma.currentPage.selection[0]?.type !== "WIDGET"
            ? figma.currentPage.selection[0].id
            : "",
      };
      emit("UPDATE_OR_CREATE_NOTE", newNote);
    });
  };
  const toggleShowAllNotes = () => {
    setShowAllNotes(!showAllNotes);
  };

  return (
    <AutoLayout
      direction="vertical"
      width={329}
      height="hug-contents"
      fill="#E5E5E5"
      cornerRadius={16}
    >
      <AutoLayout
        direction="horizontal"
        horizontalAlignItems="start"
        verticalAlignItems="center"
        spacing="auto"
        padding={16}
        fill="#000"
        width={329}
        height={49}
        cornerRadius={{ topLeft: 16, topRight: 4 }}
      >
        <Text fontSize={18} fill="#fff" fontWeight={700}>
          Notes
        </Text>
        <SVG src={newNoteIcon} onClick={addNewNote} />
      </AutoLayout>
      <NotesList
        notes={notes.values().sort((a, b) => b.createdAt - a.createdAt)}
        addNewNote={addNewNote}
        showAllNotes={showAllNotes}
        toggleShowAllNotes={toggleShowAllNotes}
      />
    </AutoLayout>
  );
}
