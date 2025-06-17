import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import type { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  tasks: Array<Task>;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}
function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  deleteTask,
  updateTask,
  tasks,
}: Props) {
  const [editMode, setEditMode] = useState(false);
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
    disabled: editMode,
  });

  const style = { transition, transform: CSS.Transform.toString(transform) };

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

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
      ref={setNodeRef}
      style={style}
      className="bg-[#161C22] w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col m-4"
    >
      {/* column title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="bg-[#0d1117] text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-[#161c22] border-4 flex items-center justify-between"
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-[#161c22] px-2 py-1 text-sm rounded-full">
            0
          </div>
          <p>{!editMode && column.title}</p>
          {editMode && (
            <input
              value={column.title}
              className="bg-black focus:border-rose-500 border-rounded outline-none px-2"
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditMode(false);
                }
              }}
            />
          )}
        </div>
        <button
          className="hover:bg-[#161c22] rounded stroke-gray-500 hover:stroke-gray-100 px-1 py-1 z-10"
          onClick={() => deleteColumn(column.id)}
        >
          <TrashIcon />
        </button>
      </div>
      {/* column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              task={task}
              key={task.id}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* Column footer */}
      <button
        className="flex gap-2 items-center border-[#161c22] border-2 rounded-md p-2 mx-2 border-x-[#161c22] hover:bg-[#0d1117] hover:text-rose-500 active:bg-black "
        onClick={() => createTask(column.id)}
      >
        <PlusIcon />
        Add task
      </button>
    </div>
  );
}

export default ColumnContainer;
