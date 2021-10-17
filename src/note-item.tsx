/** @jsx figma.widget.h */

const { widget } = figma;
const { AutoLayout, Text, useWidgetId } = widget;
import { showUI, emit, on } from "@create-figma-plugin/utilities";
import { NoteItemProp } from ".";

const NoteItem = ({ note }: NoteItemProp) => {
  const thisWidgetId = useWidgetId();

  const editNode = async (): Promise<void> => {
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
      emit("UPDATE_OR_CREATE_NOTE", {
        currentUser: figma.currentUser,
        note,
      });
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
      {note.creator.photoUrl && (
        <AutoLayout
          cornerRadius={48}
          width={48}
          height={48}
          fill={{
            type: "image",
            src: note.creator?.photoUrl || "",
            imageRef: note.creator?.photoUrl,
          }}
        />
      )}

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

export default NoteItem;
