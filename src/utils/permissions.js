// src/utils/permissions.js
import { 
  Home, Ticket, Users, Activity, Database, Layout, MapPin, 
  FileText, Megaphone, Shield, Settings, Key 
} from "lucide-react";

export const PERMISSIONS = {
  // Tickets
  TICKET_CREATE: 'ticket.create',
  TICKET_EDIT: 'ticket.edit',
  TICKET_EDIT_OWN: 'ticket.edit.own',
  TICKET_DELETE: 'ticket.delete',
  TICKET_DELETE_OWN: 'ticket.delete.own',
  TICKET_VIEW_ALL: 'ticket.view.all',
  TICKET_VIEW_BRANCH: 'ticket.view.branch',
  TICKET_VIEW_ASSIGNED: 'ticket.view.assigned',
  TICKET_VIEW_OWN: 'ticket.view.own',
  TICKET_ASSIGN: 'ticket.assign',
  TICKET_RESOLVE: 'ticket.resolve',
  TICKET_REOPEN: 'ticket.reopen',
  
  // Users
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  USER_VIEW_ALL: 'user.view.all',
  USER_VIEW_BRANCH: 'user.view.branch',
  USER_ASSIGN_ROLE: 'user.assign.role',
  
  // Systems
  SYSTEM_CREATE: 'system.create',
  SYSTEM_EDIT: 'system.edit',
  SYSTEM_DELETE: 'system.delete',
  SYSTEM_VIEW: 'system.view',
  
  // Departments
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_EDIT: 'department.edit',
  DEPARTMENT_DELETE: 'department.delete',
  DEPARTMENT_VIEW: 'department.view',
  
  // Branches
  BRANCH_CREATE: 'branch.create',
  BRANCH_EDIT: 'branch.edit',
  BRANCH_DELETE: 'branch.delete',
  BRANCH_VIEW: 'branch.view',
  
  // Templates
  TEMPLATE_CREATE: 'template.create',
  TEMPLATE_EDIT: 'template.edit',
  TEMPLATE_DELETE: 'template.delete',
  TEMPLATE_VIEW: 'template.view',
  
  // Announcements
  ANNOUNCEMENT_CREATE: 'announcement.create',
  ANNOUNCEMENT_EDIT: 'announcement.edit',
  ANNOUNCEMENT_DELETE: 'announcement.delete',
  ANNOUNCEMENT_VIEW: 'announcement.view',
  
  // Other
  AUDIT_VIEW: 'audit.view',
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',
  DASHBOARD_VIEW: 'dashboard.view',
  ACTIVITY_VIEW: 'activity.view'
};

export const PERMISSION_GROUPS = {
  'Tickets': [
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_EDIT,
    PERMISSIONS.TICKET_EDIT_OWN,
    PERMISSIONS.TICKET_DELETE,
    PERMISSIONS.TICKET_DELETE_OWN,
    PERMISSIONS.TICKET_VIEW_ALL,
    PERMISSIONS.TICKET_VIEW_BRANCH,
    PERMISSIONS.TICKET_VIEW_ASSIGNED,
    PERMISSIONS.TICKET_VIEW_OWN,
    PERMISSIONS.TICKET_ASSIGN,
    PERMISSIONS.TICKET_RESOLVE,
    PERMISSIONS.TICKET_REOPEN,
  ],
  'Users': [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.USER_VIEW_BRANCH,
    PERMISSIONS.USER_ASSIGN_ROLE,
  ],
  'Systems': [
    PERMISSIONS.SYSTEM_CREATE,
    PERMISSIONS.SYSTEM_EDIT,
    PERMISSIONS.SYSTEM_DELETE,
    PERMISSIONS.SYSTEM_VIEW,
  ],
  'Departments': [
    PERMISSIONS.DEPARTMENT_CREATE,
    PERMISSIONS.DEPARTMENT_EDIT,
    PERMISSIONS.DEPARTMENT_DELETE,
    PERMISSIONS.DEPARTMENT_VIEW,
  ],
  'Branches': [
    PERMISSIONS.BRANCH_CREATE,
    PERMISSIONS.BRANCH_EDIT,
    PERMISSIONS.BRANCH_DELETE,
    PERMISSIONS.BRANCH_VIEW,
  ],
  'Templates': [
    PERMISSIONS.TEMPLATE_CREATE,
    PERMISSIONS.TEMPLATE_EDIT,
    PERMISSIONS.TEMPLATE_DELETE,
    PERMISSIONS.TEMPLATE_VIEW,
  ],
  'Announcements': [
    PERMISSIONS.ANNOUNCEMENT_CREATE,
    PERMISSIONS.ANNOUNCEMENT_EDIT,
    PERMISSIONS.ANNOUNCEMENT_DELETE,
    PERMISSIONS.ANNOUNCEMENT_VIEW,
  ],
  'Others': [
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
  ]
};

export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false;
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, permissions) => {
  return permissions.some(perm => hasPermission(userPermissions, perm));
};

export const hasAllPermissions = (userPermissions, permissions) => {
  return permissions.every(perm => hasPermission(userPermissions, perm));
};