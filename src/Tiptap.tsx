import Placeholder from '@tiptap/extension-placeholder';
import { useEditor, EditorContent } from '@tiptap/react';
import { Content } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit'
import { h } from 'preact'
import '!./styles.css';

type TipTapProps = {
  handleUpdate: Function,
  content: Content,
  canEdit: boolean
}
const Tiptap = ({handleUpdate, content, canEdit}: TipTapProps) => {
  const innerEditorClass = canEdit ? "inner-editor can-edit" : "inner-editor"
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing in Markdown',
      })    ],
    autofocus: true,
    editorProps: {
      editable: () => canEdit,
      attributes: {
        class: innerEditorClass,
      },
    },
    onUpdate({ editor }) {
      const previewText = editor.getText().split("\n")[0].substring(0, 27);
      handleUpdate(editor.getJSON(), previewText);
    },
    content
  })

  return (
    <div class="element">
      <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap;