// Centralized permission helpers used by UI
export const isAdmin = (user) => user?.role === "admin";
export const isPM = (user) => user?.role === "pm";
export const isMember = (user) => user?.role === "member";

export const canCreateProject = (user) => isAdmin(user) || isPM(user);
export const canDeleteProject = (user) => isAdmin(user) || isPM(user);
export const canAddUserToProject = (user) => isAdmin(user) || isPM(user);
export const canViewReports = (user) => isAdmin(user) || isPM(user);
export const canDeleteIssue = (user) => isAdmin(user);

// For actions involving a specific project, pass project.permissions
export const canCreateIssue = (user, projectPermissions = {}) => {
  if (!user) return false;
  if (isAdmin(user) || isPM(user)) return true;
  if (isMember(user)) return !!projectPermissions.memberCreateIssue;
  return false;
};

export const canChangeIssueStatus = (user, projectPermissions = {}) => {
  if (!user) return false;
  if (isAdmin(user) || isPM(user)) return true;
  if (isMember(user)) return !!projectPermissions.memberChangeStatus;
  return false;
};

export const canEditWorkflow = (user, projectPermissions = {}) => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (isPM(user)) return !!projectPermissions.pmEditWorkflow;
  return false;
};

export const canAssignIssue = (user) => isAdmin(user) || isPM(user);

export default {
  isAdmin,
  isPM,
  isMember,
  canCreateProject,
  canDeleteProject,
  canAddUserToProject,
  canViewReports,
  canDeleteIssue,
  canCreateIssue,
  canChangeIssueStatus,
  canEditWorkflow,
  canAssignIssue,
};
