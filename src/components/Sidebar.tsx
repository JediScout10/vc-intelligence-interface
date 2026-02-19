'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠' },
  { name: 'Companies', href: '/companies', icon: '🏢' },
  { name: 'Lists', href: '/lists', icon: '📋' },
  { name: 'Saved', href: '/saved', icon: '⭐' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get active item based on current pathname
  const getActiveItem = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/companies')) return 'Companies';
    if (pathname.startsWith('/lists')) return 'Lists';
    if (pathname.startsWith('/saved')) return 'Saved';
    return 'Dashboard'; // Default
  };

  const activeItem = mounted ? getActiveItem() : 'Dashboard';

  return (
    <div className="w-64 bg-neutral-950 border-r border-neutral-800 h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">VC Intelligence</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ease-in-out ${
                  activeItem === item.name
                    ? 'bg-neutral-800 text-white shadow-sm border-l-2 border-blue-500'
                    : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                }`}
                suppressHydrationWarning
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
