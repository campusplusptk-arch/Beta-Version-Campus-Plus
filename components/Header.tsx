"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Calendar",
    path: "/calendar",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    path: "/",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 9.75L12 4l9 5.75-9 5.75-9-5.75z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19.25L5.25 15m13.5 0L12 19.25"
        />
      </svg>
    ),
  },
  {
    label: "Create Event",
    path: "/events/create",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
] as const;

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-primary-700">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-white sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 ring-1 ring-white/20">
            <span className="text-xl font-bold text-secondary-500">PTK</span>
          </div>
          <span className="text-xl font-bold text-white">Campus Plus</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {navItems.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(path)
                  ? "bg-white/20 text-white shadow-soft"
                  : "bg-white/10 text-white/90 hover:bg-white/15"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block" />
      </nav>

      <div className="flex items-center justify-around border-t border-neutral-200/50 bg-primary-700 px-4 py-3 md:hidden">
        {navItems.map(({ label, path, icon }) => (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 ${
              isActive(path)
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            {icon}
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}

