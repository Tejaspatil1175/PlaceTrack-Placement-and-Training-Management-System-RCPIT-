import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../store/authStore';
import { getTpoAnalyticsApi, getCoordinatorAnalyticsApi } from '../../api/analytics';
import { getMeApi } from '../../api/auth';
import { getMyApplicationsApi } from '../../api/applications';
import { getDrivesApi } from '../../api/drives';
import { getNotificationsApi } from '../../api/notifications';
import { getEventsApi } from '../../api/events';
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
        } else if (normalizedRole === 'student') {
          const [meRes, appsRes, drivesRes, notifsRes, eventsRes] = await Promise.allSettled([
            getMeApi(),
            getMyApplicationsApi(),
            getDrivesApi(),
            getNotificationsApi(),
            getEventsApi(),
          ]);

          const meData = meRes.status === 'fulfilled' ? meRes.value?.data || meRes.value : null;
          const appsData = appsRes.status === 'fulfilled' ? appsRes.value?.data || appsRes.value : [];
          const drivesData = drivesRes.status === 'fulfilled' ? drivesRes.value?.data || drivesRes.value : [];
          const notifsData = notifsRes.status === 'fulfilled' ? notifsRes.value?.data || notifsRes.value : [];
          const eventsData = eventsRes.status === 'fulfilled' ? eventsRes.value?.data || eventsRes.value : [];

          const profile = meData?.studentProfile || meData?.profile || user?.studentProfile || {};
          const userObj = meData?.user || meData || user || {};

          const appsList = Array.isArray(appsData) ? appsData : [];
          const drivesList = Array.isArray(drivesData) ? drivesData : [];
          const eligibleDrives = drivesList.filter((d) => d.isEligible !== false);

          return {
            student: {
              name: userObj.name || user?.name,
              prn: userObj.prn || user?.prn,
              branch: profile.branch || userObj.department?.name || user?.departmentName || 'Engineering',
              semester: profile.currentSemester || 7,
              cgpa: profile.cgpa ? parseFloat(profile.cgpa).toFixed(2) : '0.00',
              activeBacklogs: profile.activeBacklogs ?? 0,
              resumeUrl: profile.resumeUrl,
              skills: profile.skills || [],
            },
            stats: {
              cgpa: profile.cgpa ? parseFloat(profile.cgpa).toFixed(2) : '0.00',
              activeBacklogs: profile.activeBacklogs ?? 0,
              applicationsCount: appsList.length,
              eligibleDrivesCount: eligibleDrives.length,
            },
            eligibleDrives: eligibleDrives.slice(0, 5),
            notifications: Array.isArray(notifsData) ? notifsData.slice(0, 5) : [],
            events: Array.isArray(eventsData) ? eventsData.slice(0, 5) : [],
          };
        }
        return null;
      } catch (err) {
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
