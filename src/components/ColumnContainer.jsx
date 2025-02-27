import React from "react";
import Trash from "../assets/Trash";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
function ColumnContainer({ column, deleteColumn }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      column,
      type: "Column",
    },
  });
  const style = { transition, transform: CSS.Transform.toString(transform) };

  if (isDragging) {
    return (
      <div
        className="bg-[#161C22] w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col m-4 opacity-60 border-2 border-rose-400"
        ref={setNodeRef}
        style={style}
      ></div>
    );
  }
  return (
    <div
      className="bg-[#161C22] w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col m-4"
      ref={setNodeRef}
      style={style}
    >
      {/* column title */}
      <div className=" text-md cursor-grab mx-auto mt-1 w-[98%] h-[40px] rounded-md p-3 font-bold border-[#161C22] bg-[#0D1117] flex flex-row gap-2  items-center justify-between">
        <div {...attributes} {...listeners} className="flex flex-grow gap-3">
          <div className="rounded-2xl bg-[#161C22] w-[20px] ">0</div>
          <p>{column.title}</p>
        </div>
        <button
          className="hover:bg-gray-700 rounded stroke-gray-700 hover:stroke-gray-100 px-1 py-1 z-10"
          onClick={() => deleteColumn(column.id)}
        >
          <Trash className="h-[25px] w-[25px]" />
        </button>
      </div>
      {/* column task container */}
      <div className="flex flex-grow">Content</div>
      {/* column footer */}
      <div className="flex ">Footer</div>
    </div>
  );
}

export default ColumnContainer;
