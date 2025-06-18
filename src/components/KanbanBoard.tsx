import { useMemo, useState, useEffect } from "react";
import PlusIcon from "../icons/PlusIcon";
import type { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";

const ROOT_URL = "http://localhost:5000";

interface User {
  _id: string;
  email: string;
  name: string;
  columns: string[];
}

interface KanbanBoardProps {
  user: User;
  onLogout: () => void;
}

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function KanbanBoard({ user, onLogout }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Fetch user's columns and tasks on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${ROOT_URL}/api/columns/${user._id}`);
        const userColumns = await response.json();
        
        const processedColumns = userColumns.map((col: any) => ({
          id: col._id,
          title: col.title
        }));
        setColumns(processedColumns);

        // Extract all tasks from all columns
        const allTasks: Task[] = [];
        userColumns.forEach((column: any) => {
          if (column.tasks) {
            column.tasks.forEach((task: any) => {
              allTasks.push({
                id: task._id,
                columnId: column._id,
                content: task.content,
              });
            });
          }
        });
        setTasks(allTasks);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  const createNewColumn = async () => {
    try {
      const response = await fetch(`${ROOT_URL}/api/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Column ${columns.length + 1}`,
          userId: user._id,
        }),
      });
      const newColumn = await response.json();
      const columnToAdd: Column = {
        id: newColumn._id,
        title: newColumn.title,
      };
      setColumns([...columns, columnToAdd]);
    } catch (error) {
      console.error("Failed to create column:", error);
    }
  };
  const deleteColumn = async (id: Id) => {
    try {
      await fetch(`${ROOT_URL}/api/columns/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });
      const newcolumns = columns.filter((col) => col.id != id);
      setColumns(newcolumns);

      const newtasks = tasks.filter((t) => t.columnId !== id);
      setTasks(newtasks);
    } catch (error) {
      console.error("Failed to delete column:", error);
    }
  };
  const updateColumn = async (id: Id, title: string) => {
    try {
      await fetch(`${ROOT_URL}/api/columns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      const newColumns = columns.map((col) => {
        if (col.id !== id) return col;
        return { ...col, title };
      });
      setColumns(newColumns);
    } catch (error) {
      console.error("Failed to update column:", error);
    }
  };
  const createTask = async (columnId: Id) => {
    try {
      const response = await fetch(`${ROOT_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columnId: columnId,
          content: `Task ${tasks.length + 1}`,
        }),
      });
      const newTask = await response.json();
      const taskToAdd: Task = {
        id: newTask._id,
        columnId,
        content: newTask.content,
      };
      setTasks([...tasks, taskToAdd]);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const updateTask = async (id: Id, content: string) => {
    try {
      await fetch(`${ROOT_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const newTasks = tasks.map((task) => {
        if (task.id !== id) return task;
        return { ...task, content };
      });
      setTasks(newTasks);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const deleteTask = async (id: Id) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        await fetch(`${ROOT_URL}/api/tasks/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ columnId: task.columnId }),
        });
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    //dropping task over another task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    //dropping task over column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center">
        <div className="text-white text-xl">Loading your boards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-auto overflow-y-hidden">
      <div className="flex justify-between items-center p-4 bg-[#0d1117] border-b border-[#161c22]">
        <div className="text-white">
          <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-[#161c22] text-white rounded-lg border-2 border-[#161c22] hover:bg-rose-600 hover:border-rose-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="flex min-h-[calc(100vh-80px)] w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
        <DndContext
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          sensors={sensors}
        >
          <div className="m-auto flex gap-4">
            <div className="flex gap-4">
              <SortableContext items={columnsId}>
                {columns.map((col) => {
                  const columnTasks = tasks.filter(
                    (task) => task.columnId === col.id
                  );
                  return (
                    <ColumnContainer
                      updateTask={updateTask}
                      tasks={columnTasks}
                      deleteTask={deleteTask}
                      createTask={createTask}
                      updateColumn={updateColumn}
                      key={col.id}
                      column={col}
                      deleteColumn={deleteColumn}
                    />
                  );
                })}
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
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  updateTask={updateTask}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                  deleteTask={deleteTask}
                  createTask={createTask}
                  updateColumn={updateColumn}
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  key={activeColumn.id}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
}

export default KanbanBoard;
