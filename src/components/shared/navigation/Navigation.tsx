'use client';

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@heroui/react';
import { useAuthActions } from '@convex-dev/auth/react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/lists', label: 'Lists', icon: '📋' },
  { path: '/send', label: 'Send Emails', icon: '📧' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
];

interface Props {}

export function Navigation({}: Props) {
  const location = useLocation();
  const { signOut } = useAuthActions();

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">📧 Email Manager</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              color="danger"
              variant="light"
              onPress={() => void signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

