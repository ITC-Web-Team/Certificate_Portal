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
  const username = JSON.parse(localStorage.getItem('user') || '{}').name;

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/certificates", label: "Certificates" },
    { path: "/templates", label: "MyTemplates" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center px-4">
          <div className="flex flex-1 items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/img/logo.png" alt="Logo" className="h-8 w-8 rounded-lg" />
                <span className="font-semibold text-[#101828] hidden sm:inline">
                  CertificatePortal
                </span>
              </Link>

              {/* Mobile menu button */}
              <button
                className="sm:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-[#101828]" />
                ) : (
                  <Menu className="h-6 w-6 text-[#101828]" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-1">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={buttonVariants({
                    variant: "ghost",
                    className: cn(
                      "px-4 text-xs font-extralight border-b-2 hover:bg-transparent shadow-none rounded-none border-transparent",
                      isActive(path)
                        ? "text-[#101828] border-b-2 border-[#101828]"
                        : "text-[#475467] hover:text-[#101828]"
                    ),
                  })}
                >
                  {label}
                </Link>
              ))}

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 text-xs font-extralight hover:bg-transparent shadow-none"
                  >
                    {username}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-[#F04438] cursor-pointer text-sm"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="sm:hidden border-t bg-white">
            <nav className="flex flex-col py-2">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    isActive(path)
                      ? "text-[#101828] bg-gray-50"
                      : "text-[#475467] hover:text-[#101828] hover:bg-gray-50"
                  )}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-[#F04438] hover:bg-gray-50 text-left"
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <Outlet />
      </main>

      <footer className="mt-auto border-t bg-white">
        <div className="container py-4 sm:py-6 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Left side - Logo and copyright */}
            <div className="flex items-center gap-2">
              <img src="/img/logo.png" alt="Logo" className="h-6 w-6 rounded-lg" />
              <div className="text-xs sm:text-sm text-[#475467]">
                Developed and maintained by ITC Web Team with ❤️
              </div>
            </div>

            {/* Right side - Links */}
            <div className="flex items-center gap-1 text-xs sm:text-sm text-[#475467] hover:text-[#101828] transition-colors">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
              <p>Star the project on</p>
              <a
                href="https://github.com/ITC-Web-Team/Certificate_Portal"
                target="_blank"
                rel="noreferrer"
                className="flex gap-1 sm:gap-2 underline"
              >
                github
                <GitHubLogoIcon className="h-3 w-3 sm:h-4 sm:w-4 text-black fill-black cursor-pointer" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 