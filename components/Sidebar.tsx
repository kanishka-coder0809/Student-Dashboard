'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, BookOpen } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/marks', label: 'Marks', icon: FileText },
    { href: '/classes', label: 'Classes', icon: BookOpen },
  ]

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <div className="flex items-start gap-3">
          <div className="sidebar-logo">S</div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Student suite
            </div>
            <div className="mt-1 text-lg font-bold leading-tight text-slate-950">Management</div>
            <div className="text-sm text-slate-500">Dashboard workspace</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Main menu
        </div>
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href)

            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={active ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
                >
                  <span className={active ? 'sidebar-icon sidebar-icon-active' : 'sidebar-icon'}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
          <div className="text-sm font-semibold text-slate-900">Ready to manage</div>
          <div className="mt-1 text-xs text-slate-500">Students, classes, and marks in one place.</div>
        </div>
      </div>
    </aside>
  )
}
