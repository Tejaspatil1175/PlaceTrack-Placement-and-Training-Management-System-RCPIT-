import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { LoginPage } from '../pages/LoginPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Features
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { StudentsListPage } from '../features/students/StudentsListPage';
import { StudentDetailPage } from '../features/students/StudentDetailPage';
import { StudentImportPage } from '../features/students/StudentImportPage';

import { DrivesListPage } from '../features/drives/DrivesListPage';
import { DriveCreatePage } from '../features/drives/DriveCreatePage';
import { DriveDetailPage } from '../features/drives/DriveDetailPage';
import { DriveEligibleStudentsPage } from '../features/drives/DriveEligibleStudentsPage';

import {
  DepartmentsPage,
  CoordinatorsPage,
  CoordinatorCreatePage,
  ApplicationsPage,
  ApplicationDetailPage,
  NotificationsPage,
  NotificationCreatePage,
  EventsPage,
  EventCreatePage,
  AnalyticsPage,
  ReportsPage,
  UploadLogsPage,
  StudentProfilePage,
  StudentAcademicsPage,
  SettingsPage,
} from '../pages/PlaceholderPages';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Unauthenticated Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Authenticated Protected Shell */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['tpo', 'coordinator', 'student']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* /dashboard — officer, coordinator, student */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* /departments — officer only */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={['tpo']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />

        {/* /coordinators — officer only */}
        <Route
          path="/coordinators"
          element={
            <ProtectedRoute allowedRoles={['tpo']}>
              <CoordinatorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coordinators/new"
          element={
            <ProtectedRoute allowedRoles={['tpo']}>
              <CoordinatorCreatePage />
            </ProtectedRoute>
          }
        />

        {/* /students — officer, coordinator */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['tpo', 'coordinator']}>
              <StudentsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/import"
          element={
            <ProtectedRoute allowedRoles={['tpo', 'coordinator']}>
              <StudentImportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <ProtectedRoute allowedRoles={['tpo', 'coordinator']}>
              <StudentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* /drives — officer, coordinator, student (Single shared feature) */}
        <Route path="/drives" element={<DrivesListPage />} />
        <Route
          path="/drives/new"
          element={
            <ProtectedRoute allowedRoles={['tpo']}>
              <DriveCreatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/drives/:id" element={<DriveDetailPage />} />
        <Route
          path="/drives/:id/eligible-students"
          element={
            <ProtectedRoute allowedRoles={['tpo', 'coordinator']}>
              <DriveEligibleStudentsPage />
            </ProtectedRoute>
          }
        />

        {/* /applications — officer, coordinator, student */}
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ApplicationDetailPage />
            </ProtectedRoute>
          }
        />

        {/* /notifications — officer, coordinator, student */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/notifications/new"
          element={
            <ProtectedRoute allowedRoles={['tpo', 'coordinator']}>
              <NotificationCreatePage />
            </ProtectedRoute>
          }
        />

        {/* /events — officer, coordinator, student */}
        <Route path="/events" element={<EventsPage />} />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute allowedRoles={['tpo', 'coordinator']}>
              <EventCreatePage />
            </ProtectedRoute>
          }
        />

        {/* /analytics — officer, coordinator */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['tpo', 'coordinator']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* /reports — officer only */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['tpo']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* /upload-logs — officer only */}
        <Route
          path="/upload-logs"
          element={
            <ProtectedRoute allowedRoles={['tpo']}>
              <UploadLogsPage />
            </ProtectedRoute>
          }
        />

        {/* /profile — student only */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />

        {/* /academics — student only */}
        <Route
          path="/academics"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentAcademicsPage />
            </ProtectedRoute>
          }
        />

        {/* /settings — officer, coordinator, student */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
