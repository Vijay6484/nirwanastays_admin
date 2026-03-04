import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Building2, Image, Coffee, Calendar, Ticket, FileText, Grid, Package, Users } from 'lucide-react';

const MobileNav: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Accommodations', path: '/accommodations', icon: <Building2 size={20} /> },
    { name: 'Bookings', path: '/bookings', icon: <Calendar size={20} /> },
    { name: 'Coupons', path: '/coupons', icon: <Ticket size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 ${
                isActive ? 'text-blue-700' : 'text-gray-500 hover:text-blue-700'
              }`
            }
          >
            <div>{item.icon}</div>
            <span className="text-xs mt-1">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;