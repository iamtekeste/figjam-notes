/** @jsx figma.widget.h */

import { EmptyStateProp } from ".";

const { widget } = figma;
const {Text} = widget;
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

export default EmptyState;
