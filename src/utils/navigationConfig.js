// Dynamic navigation configuration based on user roles
export const getNavigationItems = (userRole, permissions = []) => {
  const baseNavigationItems = [
    {
      label: 'Overview',
      path: '/practice-performance-overview-dashboard',
      icon: 'BarChart3',
      description: 'Strategic command center',
      requiredRoles: ['super_admin', 'practice_admin', 'manager'],
      requiredPermissions: []
    },
    {
      label: 'Patients',
      path: '/patient-management-dashboard',
      icon: 'Users',
      description: 'Patient management and records',
      requiredRoles: ['super_admin', 'practice_admin', 'dentist', 'hygienist', 'receptionist', 'manager'],
      requiredPermissions: ['view_patients']
    },
    {
      label: 'Appointments',
      path: '/appointment-scheduler',
      icon: 'Calendar',
      description: 'Schedule and manage appointments',
      requiredRoles: ['super_admin', 'practice_admin', 'dentist', 'receptionist', 'manager'],
      requiredPermissions: ['manage_appointments']
    },
    {
      label: 'Leads',
      path: '/lead-management-screen',
      icon: 'UserPlus',
      description: 'Lead tracking and conversion',
      requiredRoles: ['super_admin', 'practice_admin', 'manager'],
      requiredPermissions: ['view_leads']
    },
    {
      label: 'Patient Analytics',
      path: '/patient-journey-revenue-optimization-dashboard',
      icon: 'TrendingUp',
      description: 'Lifecycle and revenue optimization',
      requiredRoles: ['super_admin', 'practice_admin', 'manager'],
      requiredPermissions: ['view_analytics']
    },
    {
      label: 'Lead Performance',
      path: '/lead-generation-conversion-analytics-dashboard',
      icon: 'BarChart2',
      description: 'Marketing effectiveness analysis',
      requiredRoles: ['super_admin', 'practice_admin', 'manager'],
      requiredPermissions: ['view_marketing_analytics']
    },
    {
      label: 'Compliance',
      path: '/compliance-operations-monitoring-dashboard',
      icon: 'Shield',
      description: 'Regulatory monitoring',
      requiredRoles: ['super_admin', 'practice_admin', 'manager'],
      requiredPermissions: ['view_compliance']
    },
    {
      label: 'Widget Config',
      path: '/widget-configuration-dashboard',
      icon: 'Settings',
      description: 'Configure booking widgets',
      requiredRoles: ['super_admin', 'practice_admin'],
      requiredPermissions: ['manage_widgets']
    },
    {
      label: 'Cross-Site Analytics',
      path: '/cross-site-analytics-dashboard',
      icon: 'Globe',
      description: 'Multi-site performance analysis',
      requiredRoles: ['super_admin'],
      requiredPermissions: ['view_cross_site_analytics']
    }
  ];

  // Filter navigation items based on user role and permissions
  return baseNavigationItems?.filter(item => {
    // Check role access
    const hasRoleAccess = !item?.requiredRoles || 
                         item?.requiredRoles?.length === 0 || 
                         item?.requiredRoles?.includes(userRole);

    // Check permission access
    const hasPermissionAccess = !item?.requiredPermissions || 
                               item?.requiredPermissions?.length === 0 ||
                               item?.requiredPermissions?.every(permission => 
                                 permissions?.includes(permission));

    return hasRoleAccess && hasPermissionAccess;
  });
};

// Role hierarchy for permission inheritance
export const roleHierarchy = {
  super_admin: ['super_admin', 'practice_admin', 'manager', 'dentist', 'hygienist', 'receptionist'],
  practice_admin: ['practice_admin', 'manager', 'dentist', 'hygienist', 'receptionist'],
  manager: ['manager', 'dentist', 'hygienist', 'receptionist'],
  dentist: ['dentist'],
  hygienist: ['hygienist'],
  receptionist: ['receptionist']
};

// Default permissions by role
export const defaultPermissions = {
  super_admin: [
    'view_patients', 'manage_patients', 'manage_appointments', 'view_leads', 
    'manage_leads', 'view_analytics', 'view_marketing_analytics', 'view_compliance', 
    'manage_compliance', 'manage_widgets', 'view_cross_site_analytics', 'manage_system'
  ],
  practice_admin: [
    'view_patients', 'manage_patients', 'manage_appointments', 'view_leads', 
    'manage_leads', 'view_analytics', 'view_marketing_analytics', 'view_compliance', 
    'manage_compliance', 'manage_widgets'
  ],
  manager: [
    'view_patients', 'manage_patients', 'manage_appointments', 'view_leads', 
    'view_analytics', 'view_marketing_analytics', 'view_compliance'
  ],
  dentist: [
    'view_patients', 'manage_patients', 'manage_appointments', 'view_compliance'
  ],
  hygienist: [
    'view_patients', 'manage_patients', 'manage_appointments'
  ],
  receptionist: [
    'view_patients', 'manage_appointments'
  ]
};

// Get effective permissions for a user role
export const getEffectivePermissions = (userRole, customPermissions = []) => {
  const rolePermissions = defaultPermissions?.[userRole] || [];
  return [.new Set([.rolePermissions, .customPermissions])];
};

// Check if user has specific permission
export const hasPermission = (userRole, requiredPermission, customPermissions = []) => {
  const effectivePermissions = getEffectivePermissions(userRole, customPermissions);
  return effectivePermissions?.includes(requiredPermission);
};

// Get accessible routes for a user
export const getAccessibleRoutes = (userRole, permissions = []) => {
  const navigationItems = getNavigationItems(userRole, permissions);
  return navigationItems?.map(item => item?.path);
};