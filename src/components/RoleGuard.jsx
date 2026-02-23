import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RoleGuard({ children, allowedRoles }) {
  const role = useSelector((s) => s.auth.user?.role);
  const location = useLocation();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
}
