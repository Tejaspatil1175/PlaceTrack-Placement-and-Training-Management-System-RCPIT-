import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../store/authStore';
import { getTpoAnalyticsApi, getCoordinatorAnalyticsApi } from '../../api/analytics';
import { OfficerDashboardView } from './OfficerDashboardView';
import { CoordinatorDashboardView } from './CoordinatorDashboardView';
import { StudentDashboardView } from './StudentDashboardView';

export function DashboardPage() {
  const { user, role } = useAuth();
  const normalizedRole = role === 'officer' ? 'tpo' : role || 'student';

  // TanStack Query for Analytics Data
  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ['dashboardAnalytics', normalizedRole, user?.id],
    queryFn: async () => {
      try {
        if (normalizedRole === 'tpo') {
          return await getTpoAnalyticsApi();
        } else if (normalizedRole === 'coordinator') {
          return await getCoordinatorAnalyticsApi();
        }
        return null;
      } catch (err) {
        // Return null on offline / unmounted API so view renders fallback data
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // Branch rendering inside the single Dashboard component
  if (normalizedRole === 'tpo') {
    return <OfficerDashboardView data={analyticsData} isLoading={isLoading} user={user} />;
  }

  if (normalizedRole === 'coordinator') {
    return <CoordinatorDashboardView data={analyticsData} isLoading={isLoading} user={user} />;
  }

  return <StudentDashboardView data={analyticsData} isLoading={isLoading} user={user} />;
}
