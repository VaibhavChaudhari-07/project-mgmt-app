const User = require("../models/User");

/**
 * Determine whether a user can perform an action on a project/task based on
 * who owns the project (admin or pm) and the user's role.
 *
 * Actions supported (string):
 * - edit_project, delete_project, add_member, remove_member, remove_pm, remove_admin
 * - view_all_tasks, create_task, edit_any_task, delete_task
 * - assign_users, change_status, change_priority, drag_task
 * - view_comment, add_comment
 */
async function canPerform(user, project, action, task = null) {
  if (!user || !project) return false;

  // ensure we have owner role
  let ownerRole;
  if (project.createdBy && project.createdBy.role) {
    ownerRole = project.createdBy.role;
  } else {
    const owner = await User.findById(project.createdBy).select("role");
    ownerRole = owner ? owner.role : null;
  }

  const role = user.role;

  // helper: is the current user the project owner?
  const isOwner = String(project.createdBy) === String(user._id);

  // CASE: Owner is admin
  if (ownerRole === "admin") {
    if (role === "admin") {
      // Admins (owner or other admins) have broad rights when owner is admin.
      switch (action) {
        case "view_project":
        case "view_members":
        case "add_member":
        case "remove_member":
        case "remove_pm":
        case "view_all_tasks":
        case "create_task":
        case "edit_any_task":
        case "assign_users":
        case "change_status":
        case "change_priority":
        case "drag_task":
        case "view_comment":
        case "add_comment":
          return true;
        case "delete_project":
        case "delete_task":
          // only owner admin can delete project; for tasks allow admin
          return action === "delete_task";
        case "remove_admin":
          return false; // cannot remove owner admin
        default:
          return false;
      }
    }

    if (role === "pm") {
      // PMs in admin-owned projects have many rights but not delete project or delete tasks
      switch (action) {
        case "view_project":
        case "view_members":
        case "add_member":
        case "remove_member":
        case "view_all_tasks":
        case "create_task":
        case "edit_any_task":
        case "assign_users":
        case "change_status":
        case "change_priority":
        case "drag_task":
        case "view_comment":
        case "add_comment":
          return true;
        case "delete_project":
        case "delete_task":
          return false;
        default:
          return false;
      }
    }

    if (role === "member") {
      switch (action) {
        case "view_project":
        case "view_members":
        case "view_all_tasks":
        case "view_comment":
        case "add_comment":
          return true;
        case "change_status":
        case "drag_task":
          // allowed only for assigned tasks
          if (!task) return false;
          const assignedIds = (task.assignees || []).map((a) => String(a));
          return assignedIds.includes(String(user._id));
        default:
          return false;
      }
    }
  }

  // CASE: Owner is PM
  if (ownerRole === "pm") {
    if (role === "pm") {
      // PMs (owner or other PMs) have broad rights when owner is PM; owner PM has full admin-like rights
      switch (action) {
        case "view_project":
        case "edit_project":
        case "delete_project":
        case "view_members":
        case "add_member":
        case "remove_member":
        case "view_all_tasks":
        case "create_task":
        case "edit_any_task":
        case "delete_task":
        case "assign_users":
        case "change_status":
        case "change_priority":
        case "drag_task":
        case "view_comment":
        case "add_comment":
          // restrict removing owner
          if (action === "remove_pm" && isOwner) return false;
          if (action === "remove_admin") return false;
          return true;
        default:
          return false;
      }
    }

    if (role === "admin") {
      // Admins on PM-owned projects have reduced rights
      switch (action) {
        case "view_project":
        case "view_members":
        case "view_all_tasks":
        case "change_status":
        case "drag_task":
        case "view_comment":
        case "add_comment":
          return true;
        default:
          return false;
      }
    }

    if (role === "member") {
      switch (action) {
        case "view_project":
        case "view_members":
        case "view_all_tasks":
        case "view_comment":
        case "add_comment":
          return true;
        case "change_status":
        case "drag_task":
          if (!task) return false;
          const assignedIds = (task.assignees || []).map((a) => String(a));
          return assignedIds.includes(String(user._id));
        default:
          return false;
      }
    }
  }

  // Default deny
  return false;
}

module.exports = { canPerform };
