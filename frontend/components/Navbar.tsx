"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, LayoutDashboard, Upload, Briefcase, Users, GitCompare } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload",     label: "Upload",    icon: Upload },
  { href: "/jobs",       label: "Jobs",      icon: Briefcase },
  { href: "/candidates", label: "Rankings",  icon: Users },
  { href: "/compare",    label: "Compare",   icon: GitCompare },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <nav className="nav-shell">
        <div className="max-w-7xl xl:max-w-350 2xl:max-w-[1600px] mx-auto px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-16 xl:h-18">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="nav-logo-icon">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="nav-logo-text">RecruitAI</span>
              <span className="nav-badge">AI</span>
            </Link>

            <div className="flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} className={`nav-link${active ? " active" : ""}`}>
                    <Icon className="w-4 h-4" />
                    {label}
                    {active && <span className="nav-link-dot" />}
                  </Link>
                );
              })}
            </div>

            <div className="nav-status">
              <span className="nav-status-dot" />
              <span className="nav-status-text">System Online</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile */}
      <nav className="mobile-nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`mobile-nav-link${active ? " active" : ""}`}>
              <Icon className="w-5 h-5" />
              <span className="mobile-nav-link-label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
