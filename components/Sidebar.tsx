'use client'

import Link from 'next/link'
import { Home, Users, FileText, Settings } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen flex flex-col">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold">S</div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Student</div>
            <div className="text-xs text-slate-500">Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="px-2 py-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100">
              <Home className="w-5 h-5 text-slate-600" />
              <span className="text-sm text-slate-700 font-medium">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/students" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100">
              <Users className="w-5 h-5 text-slate-600" />
              <span className="text-sm text-slate-700 font-medium">Students</span>
            </Link>
          </li>
          <li>
            <Link href="/marks" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100">
              <FileText className="w-5 h-5 text-slate-600" />
              <span className="text-sm text-slate-700 font-medium">Marks</span>
            </Link>
          </li>
          <li>
            <Link href="/classes" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100">
              <Users className="w-5 h-5 text-slate-600" />
              <span className="text-sm text-slate-700 font-medium">Classes</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3 bg-slate-50">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md">
            <Settings className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 transition-colors">Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  )
}
