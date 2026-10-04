import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ links, title }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">{title}</h1>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `block px-4 py-2 rounded-xl text-sm ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700 pt-4 text-sm">
          <div className="font-medium">{user?.fullName}</div>
          <div className="text-slate-400 text-xs mb-3">{user?.email}</div>
          <button
            onClick={() => { logout(); nav('/login'); }}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Logout →
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}