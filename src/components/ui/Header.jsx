import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { getNavigationItems, getEffectivePermissions } from '../../utils/navigationConfig';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState('Downtown Dental');
  const { user } = useAuth();
  const location = useLocation();

  const practices = [
    { id: 1, name: 'Downtown Dental', location: 'Main Street' },
    { id: 2, name: 'Westside Dental', location: 'Oak Avenue' },
    { id: 3, name: 'Northgate Dental', location: 'Pine Road' },
  ];

  // Get dynamic navigation based on user role and permissions
  const userRole = user?.role || 'receptionist';
  const userPermissions = getEffectivePermissions(userRole, user?.customPermissions || []);
  const navigationItems = getNavigationItems(userRole, userPermissions);

  const isActiveTab = (path) => {
    return location?.pathname === path;
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, action) => {
    if (event?.key === 'Enter' || event?.key === ' ') {
      event?.preventDefault();
      action?.();
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event?.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    document?.addEventListener('keydown', handleEscape);
    return () => document?.removeEventListener('keydown', handleEscape);
  }, [isUserMenuOpen]);

  return (
    <header className="sticky top-0 z-100 bg-card border-b border-border shadow-clinical" role="banner">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Icon name="Activity" size={24} color="white" strokeWidth={2.5} aria-hidden="true" />
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
          {/* Practice Selector - Only show for admin roles */}
          {(['super_admin', 'practice_admin', 'manager']?.includes(userRole)) && (
            <div className="relative">
              <label htmlFor="practice-selector" className="sr-only">
                Select Practice Location
              </label>
              <select
                id="practice-selector"
                value={selectedPractice}
                onChange={(e) => setSelectedPractice(e?.target?.value)}
                aria-label="Select practice location"
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
                aria-hidden="true"
              />
            </div>
          )}

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Notifications (3 unread)"
          >
            <Icon name="Bell" size={20} aria-hidden="true" />
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-warning-foreground text-xs font-medium rounded-full flex items-center justify-center"
              aria-label="3 unread notifications"
            >
              3
            </span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              onKeyDown={(e) => handleKeyDown(e, () => setIsUserMenuOpen(!isUserMenuOpen))}
              className="flex items-center space-x-2 px-3 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" aria-hidden="true" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  {user?.full_name || 'Dr. Sarah Johnson'}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {userRole?.replace('_', ' ')}
                </span>
              </div>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`text-muted-foreground transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </Button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-clinical-lg z-200 animate-fade-in"
                role="menu"
                aria-labelledby="user-menu-button"
              >
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-popover-foreground">
                    {user?.full_name || 'Dr. Sarah Johnson'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'sarah.johnson@dentalcrm.com'}
                  </p>
                </div>
                <div className="py-2">
                  <button 
                    className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted focus:bg-muted focus:outline-none transition-colors duration-150 flex items-center space-x-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <Icon name="User" size={16} aria-hidden="true" />
                    <span>Profile Settings</span>
                  </button>
                  {userPermissions?.includes('manage_system') && (
                    <button 
                      className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted focus:bg-muted focus:outline-none transition-colors duration-150 flex items-center space-x-2"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <Icon name="Settings" size={16} aria-hidden="true" />
                      <span>System Settings</span>
                    </button>
                  )}
                  <button 
                    className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted focus:bg-muted focus:outline-none transition-colors duration-150 flex items-center space-x-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <Icon name="HelpCircle" size={16} aria-hidden="true" />
                    <span>Help & Support</span>
                  </button>
                  <div className="border-t border-border mt-2 pt-2">
                    <button 
                      className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted focus:bg-muted focus:outline-none transition-colors duration-150 flex items-center space-x-2"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <Icon name="LogOut" size={16} aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Main Navigation */}
      <div className="border-t border-border bg-background">
        <nav className="flex space-x-0 px-6 overflow-x-auto" role="navigation" aria-label="Main navigation">
          {navigationItems?.map((item) => {
            const isActive = isActiveTab(item?.path);
            return (
              <Link
                key={item?.path}
                to={item?.path}
                className={`
                  relative flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ease-out whitespace-nowrap
                  border-b-2 hover:text-primary hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                  ${isActive 
                    ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item?.label} - ${item?.description}`}
              >
                <Icon 
                  name={item?.icon} 
                  size={18} 
                  className={isActive ? 'text-primary' : 'text-muted-foreground'} 
                  aria-hidden="true"
                />
                <span>{item?.label}</span>
                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" 
                    aria-hidden="true"
                  />
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
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;