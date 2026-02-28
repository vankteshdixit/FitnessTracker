import { Activity, Home, User, Utensils } from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomNav = () => {
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/food", label: "Food", icon: Utensils },
    { path: "/activity", label: "Activity", icon: Activity },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 
      bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
      border-t border-slate-200 dark:border-slate-800">

      <div className="max-w-md mx-auto flex justify-between items-center px-4 py-2">

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl
              transition-all duration-200 group
              ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/30 scale-105"
                      : "group-hover:bg-gray-100 dark:group-hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>

                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

      </div>
    </nav>
  );
};

export default BottomNav;