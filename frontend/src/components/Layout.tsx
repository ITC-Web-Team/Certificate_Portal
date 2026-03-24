import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/constants/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = user.name || user.roll || "User";

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/certificates", label: "Certificates" },
    { path: "/templates", label: "Templates" },
    { path: "/load", label: "Create" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-primary/15 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/certificates" className="flex items-center gap-2.5">
              <img src="/img/logo.png" alt="Logo" className="h-9 w-9 rounded-lg border border-primary/20" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground">Certificate Portal</p>
                <p className="text-xs text-muted-foreground">ITC Web Team</p>
              </div>
            </Link>
            <button
              className="rounded-lg border border-border/80 p-2 text-foreground sm:hidden"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "app-nav-link",
                  isActive(path) ? "app-nav-link-active" : ""
                )}
              >
                {label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-1 gap-2">
                  {username}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {isMenuOpen && (
          <div className="border-t border-border/80 bg-card sm:hidden">
            <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6 lg:px-8">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    isActive(path) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive"
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="min-h-[calc(100vh-8rem)]">
        <Outlet />
      </main>

      <footer className="border-t border-primary/15 bg-card/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <img src="/img/logo.png" alt="Logo" className="h-6 w-6 rounded-md border border-primary/20" />
            <div>
              Developed and maintained by <span className="font-semibold text-foreground">ITC Web Team</span>
            </div>
          </div>
          <a
            href="https://github.com/ITC-Web-Team/Certificate_Portal"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              variant: "ghost",
              className: "h-9 gap-2 rounded-full border border-border/70 px-3 text-muted-foreground hover:text-foreground",
            })}
          >
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-xs sm:text-sm">Star on GitHub</span>
            <GitHubLogoIcon className="h-4 w-4 fill-current" />
          </a>
        </div>
      </footer>
    </div>
  );
}