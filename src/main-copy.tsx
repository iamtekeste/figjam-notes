/** @jsx figma.widget.h */

import { showUI, emit, on } from "@create-figma-plugin/utilities";
import { Content } from "@tiptap/core";
import placeholderContent from "./placeholder-content";
const { widget } = figma;
const { AutoLayout, Text, useSyncedState, SVG, useWidgetId, Frame } = widget;

export default function () {
  widget.register(NotePad);
}

const newNoteIcon = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="14" cy="14" r="14" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14 6C13.4477 6 13 6.44772 13 7V13H7C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15H13V21C13 21.5523 13.4477 22 14 22C14.5523 22 15 21.5523 15 21V15H21C21.5523 15 22 14.5523 22 14C22 13.4477 21.5523 13 21 13H15V7C15 6.44772 14.5523 6 14 6Z" fill="black"/>
</svg>
`;
export type Note = {
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

function NotePad() {
  const thisWidget = figma.getNodeById(useWidgetId()) as WidgetNode;
  const iframePosition = {
    x: thisWidget.width + 16 + thisWidget.x,
    y: thisWidget.y,
  };
  const [notes, setNotes] = useSyncedState<Notes>(
    "all-notes",
    placeholderContent
  );
  const [showAllNotes, setShowAllNotes] = useSyncedState(
    "show-all-notes",
    false
  );

  on("NOTE-UPDATED", (note: Note) => {
    const { noteId } = note;
    const newNotes = { ...notes };
    newNotes[noteId] && delete newNotes[noteId];
    if (!note.previewText) {
      setNotes({
        ...newNotes,
      });
      return;
    } else {
      // the note has some content so add it back in
      setNotes({
        [noteId]: { ...note },
        ...newNotes,
      });
    }
  });
  on("CLOSE_PLUGIN", () => {
    figma.closePlugin();
  });
  on("DELETE_NOTE", (noteTobeDeleted) => {
    const newNotes = { ...notes };
    newNotes[noteTobeDeleted] && delete newNotes[noteTobeDeleted];
    setNotes({
      ...newNotes,
    });
    figma.notify("Note Deleted.");
    setTimeout(() => {
      figma.closePlugin();
    }, 300);
  });

  const addNewNote = async (): Promise<void> => {
    if (!figma.currentUser) return;
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
  // const deleteNote = (noteTobeDeleted) => {
  //   const updatedNotes = { ...notes };
  //   delete updatedNotes[noteTobeDeleted];
  //   setNotes({ ...updatedNotes });
  // };
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
        notes={notes}
        addNewNote={addNewNote}
        showAllNotes={showAllNotes}
        toggleShowAllNotes={toggleShowAllNotes}
        iframePosition={iframePosition}
      />
    </AutoLayout>
  );
}

type NotesListProp = {
  addNewNote: () => void | Promise<any>;
  showAllNotes: boolean;
  toggleShowAllNotes: () => void | Promise<any>;
  notes: Notes;
  iframePosition: { x: number; y: number };
};
const NotesList = ({
  notes,
  addNewNote,
  showAllNotes,
  toggleShowAllNotes,
  iframePosition,
}: NotesListProp) => {
  const noteIds = Object.keys(notes);
  const notesTobeRendered = showAllNotes ? noteIds : noteIds.slice(0, 5);
  const notesList = notesTobeRendered.map((noteId) => {
    const note = notes[noteId];
    return note.previewText ? (
      <NoteItem noteId={noteId} note={note} iframePosition={iframePosition} />
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
      {noteIds.length > 5 && (
        <Text
          onClick={toggleShowAllNotes}
          fill={{
            type: "solid",
            color: { r: 0, g: 0, b: 0, a: 0.5 },
          }}
        >
          {showAllNotes
            ? "Show less notes"
            : `Show ${noteIds.length - 5} more notes`}
        </Text>
      )}
    </AutoLayout>
  );
};
type NoteItemProp = {
  noteId: string;
  note: Note;
  iframePosition: { x: number; y: number };
};
const NoteItem = ({ noteId, note, iframePosition }: NoteItemProp) => {
  const editNode = async (): Promise<void> => {
    return new Promise((resolve) => {
      showUI({
        height: 350,
        width: 350,
        position: iframePosition,
      });
      emit("UPDATE_OR_CREATE_NOTE", {
        currentUser: figma.currentUser,
        note,
      });
    });
  };
  const deleteNote = (noteId: string): Promise<void> => {
    return new Promise((resolve) => {
      figma.showUI(__uiFiles__.editNote, {
        visible: false,
      });
      figma.ui.postMessage({
        action: "DELETE_NOTE",
        noteId,
      });
      resolve();
    });
  };
  const selectedNodeId = note?.selectedNodeId;
  const selectedNode = figma.getNodeById(selectedNodeId) as GeometryMixin;
  //@ts-ignore
  const fill = selectedNode?.fills?.[0];
  return (
    <AutoLayout
      direction="horizontal"
      width="fill-parent"
      height={48}
      fill={{
        type: "solid",
        color: { r: 1, g: 1, b: 1, a: 0 },
      }}
      verticalAlignItems="center"
      spacing={8}
    >
      <AutoLayout
        cornerRadius={48}
        width={48}
        height={48}
        fill={{
          type: "image",
          src: note.creator?.photoUrl,
          imageRef: note.creator?.photoUrl,
        }}
      ></AutoLayout>
      <AutoLayout
        direction="vertical"
        verticalAlignItems="center"
        width="fill-parent"
        fill={{
          type: "solid",
          color: { r: 1, g: 1, b: 1, a: 0 },
        }}
        spacing={0}
      >
        <AutoLayout
          direction="horizontal"
          horizontalAlignItems="start"
          verticalAlignItems="center"
          spacing="auto"
          width="fill-parent"
          height="hug-contents"
          fill={{ type: "solid", color: { r: 0, g: 0, b: 0, a: 0 } }}
        >
          <Text
            fontSize={16}
            width="fill-parent"
            onClick={editNode}
            fontFamily="Inter"
            lineHeight={24}
          >
            {note.previewText}
          </Text>
          {/* <SVG src={deleteIcon} onClick={() => deleteNote(noteId)} /> */}
        </AutoLayout>

        <AutoLayout
          direction="horizontal"
          horizontalAlignItems="start"
          verticalAlignItems="center"
          spacing="auto"
          width="fill-parent"
          height="hug-contents"
          fill={{ type: "solid", color: { r: 0, g: 0, b: 0, a: 0 } }}
        >
          <Text
            fill={{
              type: "solid",
              color: { r: 0, g: 0, b: 0, a: 0.5 },
            }}
            fontSize={12}
            width="fill-parent"
          >
            {new Date(note.createdAt).toLocaleDateString()} •{" "}
            {note.creator.name}
          </Text>
          {/* {selectedNodeId ? (
            <Rectangle
              width={12}
              height={12}
              cornerRadius={6}
              onClick={() =>
                figma.viewport.scrollAndZoomIntoView([selectedNode as BaseNode])
              }
              fill={{
                type: "solid",
                color: { ...fill.color, a: fill.opacity },
              }}
            ></Rectangle>
          ) : null} */}
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );
};
type EmptyStateProp = {
  addNewNote: () => void | Promise<any>;
};
const EmptyState = ({ addNewNote }: EmptyStateProp) => {
  return (
    <Text
      onClick={addNewNote}
      fill={{
        type: "solid",
        color: { r: 0, g: 0, b: 0, a: 0.5 },
      }}
    >
      Click to create your first note
    </Text>
  );
};
