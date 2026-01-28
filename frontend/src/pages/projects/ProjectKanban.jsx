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
import { getTeams } from "../../services/team.service";

const columns = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

function Column({ id, title, tasks }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-2 rounded min-h-[400px]">
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
        {task.assignees?.length
          ? task.assignees.map((u) => u.name).join(", ")
          : "Unassigned"}
      </div>
    </div>
  );
}

export default function ProjectKanban() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [assigneeFilter, setAssigneeFilter] = useState([]);
  const [openAssigneeDropdown, setOpenAssigneeDropdown] = useState(false);

  const loadTasks = async () => {
    const res = await getTasks(projectId);
    setTasks(res.data || []);
  };

  const loadMembers = async () => {
    const res = await getProjectById(projectId);
    setMembers(res.data.members || []);
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

  const validTeams = teams.filter((t) =>
    t.members.every((tm) => members.some((pm) => pm._id === tm._id))
  );

  const matchesAssigneeFilter = (task) => {
    if (assigneeFilter.length === 0) return true;

    return assigneeFilter.every((filter) => {
      if (filter.startsWith("user:")) {
        const userId = filter.replace("user:", "");
        return task.assignees?.some((a) => a._id === userId);
      }

      if (filter.startsWith("team:")) {
        const teamId = filter.replace("team:", "");
        const team = validTeams.find((t) => t._id === teamId);
        if (!team) return false;

        const teamIds = team.members.map((m) => m._id);
        const taskIds = (task.assignees || []).map((a) => a._id);

        return teamIds.every((id) => taskIds.includes(id));
      }

      return true;
    });
  };

  const taskMatchesFilters = (task) => {
    return (
      task.title.toLowerCase().includes(search.toLowerCase()) &&
      (!statusFilter || task.status === statusFilter) &&
      (!priorityFilter || task.priority === priorityFilter) &&
      matchesAssigneeFilter(task)
    );
  };

  const grouped = (status) =>
    tasks.filter((t) => t.status === status).filter(taskMatchesFilters);

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

  const toggleAssigneeFilter = (value) => {
    setAssigneeFilter((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          className="border p-2"
          placeholder="Search task..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <select
          className="border p-2"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Assignee filter dropdown */}
        <div className="relative w-64">
          <button
            onClick={() => setOpenAssigneeDropdown(!openAssigneeDropdown)}
            className="border p-2 w-full text-left bg-white"
          >
            {assigneeFilter.length
              ? `${assigneeFilter.length} selected`
              : "Filter by assignee ▾"}
          </button>

          {openAssigneeDropdown && (
            <div className="absolute z-30 bg-white border w-full mt-1 max-h-64 overflow-y-auto shadow">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b">
                Teams
              </div>

              {validTeams.map((t) => {
                const value = `team:${t._id}`;
                return (
                  <label
                    key={t._id}
                    className="flex items-center gap-2 px-2 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={assigneeFilter.includes(value)}
                      onChange={() => toggleAssigneeFilter(value)}
                    />
                    👥 {t.name}
                  </label>
                );
              })}

              <div className="px-2 py-1 text-xs font-semibold text-gray-500 border-b mt-2">
                Members
              </div>

              {members.map((m) => {
                const value = `user:${m._id}`;
                return (
                  <label
                    key={m._id}
                    className="flex items-center gap-2 px-2 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={assigneeFilter.includes(value)}
                      onChange={() => toggleAssigneeFilter(value)}
                    />
                    {m.name}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setPriorityFilter("");
            setAssigneeFilter([]);
          }}
          className="border px-3"
        >
          Clear
        </button>
      </div>

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
