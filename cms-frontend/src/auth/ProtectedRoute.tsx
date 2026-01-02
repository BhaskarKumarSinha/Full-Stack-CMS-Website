/**
 * @file auth/ProtectedRoute.tsx
 * @description Protected Route Wrapper Component
 *
 * This component implements client-side route protection:
 *
 * @functionality
 * - Checks for valid authentication token
 * - Redirects unauthenticated users to login page
 * - Renders children only if authenticated
 *
 * @usage
 * <Route path="/admin" element={
 *   <ProtectedRoute>
 *     <AdminLayout />
 *   </ProtectedRoute>
 * } />
 *
 * @security-note
 * This provides client-side protection only.
 * All API endpoints should also validate tokens on the backend.
 * Never rely solely on client-side authentication checks.
 *
 * @see useAuth - Custom hook for authentication state
 */

import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

/**
 * ProtectedRoute Component
 * Wraps child components and ensures user is authenticated
 *
 * @param children - Child components to render if authenticated
 * @returns Children if authenticated, Navigate to /login if not
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();

  // Redirect to login if no valid token exists
  if (!token) return <Navigate to="/login" replace />;

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
