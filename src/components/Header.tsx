import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-2 md:ml-0 text-lg md:text-xl font-semibold text-gray-800">
              <span className="bg-gradient-to-r from-nature-600 to-nature-700 bg-clip-text text-transparent">
                Lakeview Resort Admin
              </span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-600 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name || 'Admin User'}
              </span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-nature-500 to-nature-600 flex items-center justify-center text-white shadow-md">
                <User className="h-5 w-5" />
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-600 focus:outline-none ml-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;