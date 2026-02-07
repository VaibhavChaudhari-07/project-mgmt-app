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
import { getProjectById } from "../../services/project.service";
import { canChangeIssueStatus } from "../../services/permissions";
import { getTeams } from "../../services/team.service";
import { getRequiredUsers } from "../../services/user.service";

const columns = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

/* 🔹 STATUS COLUMN UI STYLES (UI ONLY) */
const columnStyles = {
  todo: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    header: "text-blue-700",
  },
  inprogress: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    header: "text-yellow-700",
  },
  review: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    header: "text-purple-700",
  },
  done: {
    bg: "bg-green-50",
    border: "border-green-200",
    header: "text-green-700",
  },
};

/* ================= COLUMN ================= */

function Column({ id, title, tasks, projectPermissions }) {
  const { setNodeRef } = useDroppable({ id });
  const style = columnStyles[id];

  return (
    <div
      ref={setNodeRef}
      className={`
        ${style.bg}
        border
        ${style.border}
        rounded-xl
        p-3
        flex
        flex-col
        min-h-[75vh]
      `}
    >
      {/* COLUMN HEADER */}
      <h3
        className={`
          text-sm
          font-semibold
          mb-3
          sticky
          top-0
          z-10
          ${style.header}
        `}
      >
        {title}
      </h3>

      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} projectPermissions={projectPermissions} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

/* ================= TASK CARD ================= */

function TaskCard({ task, projectPermissions = {} }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const canDrag = canChangeIssueStatus(user, projectPermissions);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, disabled: !canDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityStyle = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  const avatar = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      className={`rounded-lg bg-white p-3 shadow-sm border transition-all
        ${canDrag ? "cursor-grab" : "cursor-default"}
        ${isDragging ? "shadow-lg scale-[1.02]" : "hover:shadow-md"}
      `}
    >
      {/* TASK TITLE */}
      <div className="font-medium text-sm text-gray-800 mb-2">
        {task.title}
      </div>

      {/* PRIORITY */}
      <span
        className={`inline-block text-xs px-2 py-0.5 rounded mb-2 ${priorityStyle[task.priority]}`}
      >
        {task.priority.toUpperCase()}
      </span>

      {/* ASSIGNEES */}
      <div className="flex items-center gap-1 mt-2 flex-wrap">
        {(task.assignees || []).length === 0 ? (
          <span className="text-xs text-gray-400">Unassigned</span>
        ) : (
          task.assignees.map((u) => (
            <div
              key={u._id}
              title={u.name}
              className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold"
            >
              {avatar(u.name)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function ProjectKanban() {
  const { projectId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const [tasks, setTasks] = useState([]);
  const [requiredUsers, setRequiredUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projectPermissions, setProjectPermissions] = useState({});

  // compute permissions after projectPermissions state is declared
  const canUpdate = canChangeIssueStatus(user, projectPermissions);

  const loadTasks = async () => {
    const res = await getTasks(projectId);
    setTasks(res.data || []);
  };

  const loadMembers = async () => {
    try {
      const res = await getProjectById(projectId);
      setProjectPermissions(res.data.permissions || {});
      
      // Load required users from backend API
      const requiredUsersRes = await getRequiredUsers();
      setRequiredUsers(requiredUsersRes.data || []);
    } catch (err) {
      console.error("Error loading members:", err);
      setRequiredUsers([]);
    }
  };

  const loadTeams = async () => {
    const res = await getTeams();
    setTeams(res.data || []);
  };

  useEffect(() => {
    loadTasks();
    loadMembers();
    loadTeams();
  }, [projectId]);

  const grouped = (status) =>
    tasks.filter((t) => t.status === status);

  const handleDragEnd = async (event) => {
    if (!canUpdate) return;

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
      <h2 className="p-6 pt-16 text-xl font-semibold mb-4">Kanban Board</h2>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((col) => (
            <Column
              key={col.key}
              id={col.key}
              title={col.label}
              tasks={grouped(col.key)}
              projectPermissions={projectPermissions}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}