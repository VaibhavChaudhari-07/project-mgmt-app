import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getTasks, updateTask } from "../../services/task.service";

const columns = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

function Column({ id, title, tasks }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 p-2 rounded min-h-[400px]"
    >
      <h3 className="text-center font-bold mb-2">{title}</h3>

      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-2 mb-2 rounded shadow cursor-move"
    >
      <div className="font-semibold">{task.title}</div>
      <div className="text-xs text-gray-500">
        {task.assignee?.name || "Unassigned"}
      </div>
    </div>
  );
}

export default function ProjectKanban() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    const res = await getTasks(projectId);
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const grouped = (status) =>
    tasks.filter((t) => t.status === status);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    await updateTask(taskId, { status: newStatus });
    loadTasks();
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Kanban Board</h2>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => (
            <Column
              key={col.key}
              id={col.key}
              title={col.label}
              tasks={grouped(col.key)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
