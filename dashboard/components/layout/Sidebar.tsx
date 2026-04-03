'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  submenu?: NavItem[];
}

interface SidebarProps {
  guildId?: string;
  navItems: NavItem[];
}

export function Sidebar({ guildId, navItems }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-[60px] h-[calc(100vh-60px)]
        bg-bg-base border-r border-border-subtle
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-60'}
        flex flex-col
      `}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <NavItemComponent
            key={item.label}
            item={item}
            collapsed={collapsed}
            isExpanded={expandedItems.includes(item.label)}
            onToggle={() => toggleSubmenu(item.label)}
            pathname={pathname}
            guildId={guildId}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border-subtle p-4 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          {!collapsed && <span className="text-xs text-text-secondary font-medium">Online</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full px-3 py-2 text-xs font-medium text-text-secondary hover:text-pink transition-colors rounded"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  collapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
  guildId?: string;
}

function NavItemComponent({
  item,
  collapsed,
  isExpanded,
  onToggle,
  pathname,
  guildId,
}: NavItemComponentProps) {
  const href = guildId ? `/dashboard/${guildId}${item.href}` : item.href;
  const isActive = pathname === href;

  const hasSubmenu = item.submenu && item.submenu.length > 0;

  if (hasSubmenu) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={`
            w-full px-3 py-2 rounded-lg
            flex items-center justify-between
            transition-all duration-200
            ${isActive || isExpanded
              ? 'bg-pink-surface text-pink border-l-2 border-l-pink'
              : 'text-text-secondary hover:text-text-primary hover:bg-pink-surface'
            }
          `}
        >
          <span className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </span>
          {!collapsed && (
            <span
              className={`
                text-xs transition-transform duration-200
                ${isExpanded ? 'rotate-180' : ''}
              `}
            >
              ▼
            </span>
          )}
          {item.badge && !collapsed && (
            <span className="ml-auto bg-pink text-bg-base text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {item.badge}
            </span>
          )}
        </button>

        {isExpanded && !collapsed && (
          <div className="mt-1 pl-3 space-y-1 border-l border-border-subtle">
            {item.submenu?.map((subitem) => (
              <Link
                key={subitem.label}
                href={guildId ? `/dashboard/${guildId}${subitem.href}` : subitem.href}
                className={`
                  block px-3 py-2 text-xs font-medium rounded
                  transition-all duration-200
                  ${pathname === (guildId ? `/dashboard/${guildId}${subitem.href}` : subitem.href)
                    ? 'text-pink bg-pink-surface'
                    : 'text-text-secondary hover:text-text-primary hover:bg-pink-surface/50'
                  }
                `}
              >
                {subitem.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`
        block px-3 py-2 rounded-lg
        flex items-center gap-3
        transition-all duration-200
        ${isActive
          ? 'bg-pink-surface text-pink border-l-2 border-l-pink'
          : 'text-text-secondary hover:text-text-primary hover:bg-pink-surface'
        }
      `}
    >
      <span className="text-lg flex-shrink-0">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="bg-pink text-bg-base text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
