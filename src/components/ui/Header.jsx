import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState('Downtown Dental');
  const location = useLocation();

  const practices = [
    { id: 1, name: 'Downtown Dental', location: 'Main Street' },
    { id: 2, name: 'Westside Dental', location: 'Oak Avenue' },
    { id: 3, name: 'Northgate Dental', location: 'Pine Road' },
  ];

  const navigationItems = [
    {
      label: 'Overview',
      path: '/practice-performance-overview-dashboard',
      icon: 'BarChart3',
      description: 'Strategic command center'
    },
    {
      label: 'Patients',
      path: '/patient-management-dashboard',
      icon: 'Users',
      description: 'Patient management and records'
    },
    {
      label: 'Appointments',
      path: '/appointment-scheduler',
      icon: 'Calendar',
      description: 'Schedule and manage appointments'
    },
    {
      label: 'Leads',
      path: '/lead-management-screen',
      icon: 'UserPlus',
      description: 'Lead tracking and conversion'
    },
    {
      label: 'Patient Analytics',
      path: '/patient-journey-revenue-optimization-dashboard',
      icon: 'TrendingUp',
      description: 'Lifecycle and revenue optimization'
    },
    {
      label: 'Lead Performance',
      path: '/lead-generation-conversion-analytics-dashboard',
      icon: 'BarChart2',
      description: 'Marketing effectiveness analysis'
    },
    {
      label: 'Compliance',
      path: '/compliance-operations-monitoring-dashboard',
      icon: 'Shield',
      description: 'Regulatory monitoring'
    }
  ];

  const isActiveTab = (path) => {
    return location?.pathname === path;
  };

  return (
    <header className="sticky top-0 z-100 bg-card border-b border-border shadow-clinical">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Icon name="Activity" size={24} color="white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground leading-tight">
              Postino's Yolo CRM
            </h1>
            <span className="text-xs text-muted-foreground font-medium">
              Healthcare Intelligence Platform
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Practice Selector */}
          <div className="relative">
            <select
              value={selectedPractice}
              onChange={(e) => setSelectedPractice(e?.target?.value)}
              className="appearance-none bg-muted border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-150"
            >
              {practices?.map((practice) => (
                <option key={practice?.id} value={practice?.name}>
                  {practice?.name}
                </option>
              ))}
            </select>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" 
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Icon name="Bell" size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-warning-foreground text-xs font-medium rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">Dr. Sarah Johnson</span>
                <span className="text-xs text-muted-foreground">Practice Owner</span>
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </Button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-clinical-lg z-200 animate-fade-in">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-popover-foreground">Dr. Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">sarah.johnson@dentalcrm.com</p>
                </div>
                <div className="py-2">
                  <button className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 flex items-center space-x-2">
                    <Icon name="User" size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 flex items-center space-x-2">
                    <Icon name="Settings" size={16} />
                    <span>System Settings</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-150 flex items-center space-x-2">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help & Support</span>
                  </button>
                  <div className="border-t border-border mt-2 pt-2">
                    <button className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted transition-colors duration-150 flex items-center space-x-2">
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="border-t border-border bg-background">
        <nav className="flex space-x-0 px-6" role="tablist">
          {navigationItems?.map((item) => {
            const isActive = isActiveTab(item?.path);
            return (
              <Link
                key={item?.path}
                to={item?.path}
                role="tab"
                aria-selected={isActive}
                className={`
                  relative flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ease-out
                  border-b-2 hover:text-primary hover:bg-muted/50
                  ${isActive 
                    ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent'
                  }
                `}
              >
                <Icon 
                  name={item?.icon} 
                  size={18} 
                  className={isActive ? 'text-primary' : 'text-muted-foreground'} 
                />
                <span>{item?.label}</span>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-100"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;