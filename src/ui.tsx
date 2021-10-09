import { Button, render } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { Content } from "@tiptap/core";
import { nanoid } from "nanoid";
import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { Note } from "./main";
import Tiptap from "./TipTap";

function Plugin(props: { text: string }) {
  const [activeNote, setActiveNote] = useState<Note>();
  const [canEdit, setCanEdit] = useState(false);

  const handleUpdate = (content: Content, previewText: string) => {
    if (!activeNote) return;
    setActiveNote({
      ...activeNote,
      content,
      previewText,
    });
    emit("NOTE-UPDATED", {
      ...activeNote,
      content,
      previewText: previewText.length >= 27 ? previewText + "..." : previewText,
    });
  };
  on(
    "UPDATE_OR_CREATE_NOTE",
    ({
      selectedNodeId,
      currentUser,
      note,
    }: {
      selectedNodeId: string;
      currentUser: User;
      note: Note;
    }) => {
      const noteId = nanoid();
      const content = "";
      const previewText = "";
      let activeNote;
      setCanEdit(false);
      if (note) {
        // we are editing an existing note
        activeNote = note;
        // check if currentUser is the same as activeUser
        // to decide whether we should let them edit or not
        setCanEdit(false);
        if (note.creator.id === currentUser.id) {
          setCanEdit(true);
        }
      } else {
        // must be creating a new one
        activeNote = {
          noteId,
          creator: currentUser,
          selectedNodeId,
          content,
          previewText,
          createdAt: Date.now(),
        };
        setCanEdit(true);
      }
      setActiveNote(activeNote);
    }
  );
  const handleDone = () => {
    emit("CLOSE_PLUGIN");
  };
  const handleDelete = () => {
    if (!activeNote) return;
    const message = confirm("Delete note?");
    if (message) {
      emit("DELETE_NOTE", activeNote?.noteId);
    }
  };

  if (!activeNote) return null;
  return (
    <Fragment>
      <div class="info-bar">
        {new Date(activeNote.createdAt).toLocaleDateString()} •{" "}
        {activeNote.creator.name}
      </div>
      <Tiptap
        handleUpdate={handleUpdate}
        content={activeNote.content}
        canEdit={canEdit}
      />
      <div class="action-bar">
        <span class="notice">Notes get saved automatically.</span>
        <Button class="save-btn" onClick={handleDone}>
          Done
        </Button>
        <Button secondary destructive onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </Fragment>
  );
}

export default render(Plugin);
