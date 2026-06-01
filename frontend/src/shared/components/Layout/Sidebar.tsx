import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Package, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../../modules/auth/store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/logistica/dashboard', icon: LayoutDashboard },
    { name: 'Rutas y Mapa', path: '/logistica/rutas', icon: Map },
    { name: 'Gestión Eventos', path: '/logistica/eventos', icon: Package },
    { name: 'Configuración', path: '/configuracion', icon: Settings },
  ];

  return (
    <aside
      className={`bg-[#003366] text-white flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      } h-full shadow-xl relative z-20`}
    >
      <div className="flex items-center justify-center h-16 border-b border-blue-800">
        <span className="font-bold text-xl tracking-wider">
          {isOpen ? 'VENADO' : 'V'}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors duration-200 overflow-hidden ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 hidden'
                  }`}
                >
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#002244]">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#002244] w-full rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
