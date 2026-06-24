// src/components/PermissionGate.jsx
import { usePermissions } from '../context/PermissionContext';

/**
 * Renders children only when the user has the required permission.
 *
 * Props:
 *   permission  – single permission string  (e.g. "ticket.delete")
 *   anyOf       – array of permissions      (user needs ANY ONE)
 *   allOf       – array of permissions      (user needs ALL)
 *   role        – exact role string         (e.g. "Super Admin")
 *   fallback    – what to render on failure (default: null)
 */
export const PermissionGate = ({
  permission,
  anyOf,
  allOf,
  role,
  children,
  fallback = null,
}) => {
  const { can, canAny, canAll } = usePermissions();
  const { user } = (() => {
    try { return { user: JSON.parse(localStorage.getItem('cbcUser') || 'null') }; }
    catch { return { user: null }; }
  })();

  if (role && user?.role !== role)       return fallback;
  if (permission && !can(permission))    return fallback;
  if (anyOf && !canAny(...anyOf))        return fallback;
  if (allOf && !canAll(...allOf))        return fallback;

  return children;
};

/** HOC: wrap a component to require a permission */
export const withPermission = (Component, permission) =>
  function PermissionWrapped(props) {
    const { can } = usePermissions();
    if (!can(permission)) return null;
    return <Component {...props} />;
  };

export default PermissionGate;
