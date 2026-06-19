import { NavLink, Link } from 'react-router-dom';
import { Heart, Sparkles, Briefcase, Baby, Stethoscope, Leaf, Smile, Palette, Flower2, Pill, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlobalMedicationPopup from '@/components/medication/GlobalMedicationPopup';

const navItems = [
  { to: '/', label: '首页', icon: Heart, end: true },
  { to: '/teen', label: '少女期', icon: Sparkles },
  { to: '/career', label: '职场期', icon: Briefcase },
  { to: '/pregnancy-prep', label: '备孕期', icon: Baby },
  { to: '/pregnancy', label: '孕期', icon: Stethoscope },
  { to: '/postpartum', label: '产后恢复', icon: Leaf },
  { to: '/relief', label: '痛经舒缓', icon: Smile },
  { to: '/nutrition', label: '营养膳食', icon: UtensilsCrossed },
  { to: '/medication', label: '用药提醒', icon: Pill },
  { to: '/mood', label: '情绪治愈', icon: Palette },
  { to: '/menopause', label: '更年期照护', icon: Flower2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 glass border-b border-white/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-lavender-500 flex items-center justify-center shadow-lg shadow-primary-200/50">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="font-display text-xl font-semibold gradient-text">
                她的周期
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'nav-link flex items-center gap-2 text-sm font-medium',
                      isActive ? 'nav-link-active' : ''
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
            
            <div className="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'nav-link flex items-center gap-1 text-xs font-medium whitespace-nowrap px-3 py-1.5',
                      isActive ? 'nav-link-active' : ''
                    )
                  }
                >
                  <item.icon className="w-3.5 h-3.5" />
                </NavLink>
              ))}
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto scrollbar-hide pb-1">
            {navItems.map((item) => (
              <NavLink
                key={`mobile-label-${item.to}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'text-xs font-medium whitespace-nowrap px-3 py-1 rounded-full transition-all',
                    isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-500 hover:text-primary-500'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <GlobalMedicationPopup />

      <footer className="glass border-t border-white/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            💕 用爱呵护每一个她 · 她的周期
          </p>
        </div>
      </footer>
    </div>
  );
}
