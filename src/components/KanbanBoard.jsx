import React, { useMemo, useState } from "react";
import PlusIcon from "../assets/PlusIcon";
import ColumnContainer from "./ColumnContainer";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [activeColumn, setActiveColumn] = useState();
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const createNewColumn = () => {
    const columnToAdd = {
      id: generateRandom(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  };
  const deleteColumn = (id) => {
    const newcolumns = columns.filter((col) => col.id != id);
    setColumns(newcolumns);
  };
  const onDragStart = (event) => {
    console.log("DRAG: ", event);
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
  };
  return (
    <DndContext onDragStart={onDragStart}>
      <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
        <div className="m-auto">
          <div className="flex flex-row ">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  column={col}
                  deleteColumn={deleteColumn}
                  key={col.id}
                />
              ))}
            </SortableContext>
          </div>
          <button
            className="h-[60px] w-[250px] min-w-[250px] cursor-pointer rounded-lg bg-[#0D1117] border-2 border-[#161C22] p-4 ring-rose-500 hover:ring-2 flex items-center gap-5"
            onClick={createNewColumn}
          >
            <PlusIcon />
            Add column
          </button>
        </div>
      </div>
      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <ColumnContainer
              column={activeColumn}
              deleteColumn={deleteColumn}
              key={activeColumn.id}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export default KanbanBoard;

//every column has an Id and title

const generateRandom = () => {
  return Math.floor(Math.random() * 10000);
};
