import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Optional helper for conditional class names
import { Roles } from "../../types/globals";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
export const NavLinks = ({ role }: { role?: Roles }) => {
  const pathname = usePathname();
  const { userId, isLoaded } = useAuth(); // Get `isLoaded` to know when auth data is ready
  const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    if (isLoaded) {
      setIsAuth(!!userId); // Set the authentication state once userId is loaded
    }
  }, [isLoaded, userId]);
const navbarLinks = [
    { linkName: "Home", link: "/" },
    { linkName: "About", link: "/about" },
    { linkName: "Services", link: "/services" },
    { linkName: "Partnerships & Media", link: "/partnership-media" },
    { linkName: "Pricing Plan", link: "/pricing-plan" },
  ];
  if (!isLoaded) return null;
  return (
    <div className="flex items-center gap-6">
      <div className="hidden md:flex gap-10 items-center">
        {navbarLinks.map((navItem, index) => {
          const isActive = pathname === navItem.link;

          // Adjust logic for rendering nav items based on user role and auth status
          if (role === "CANDIDATE" && navItem.link === "/pricing-plan") {
            return null;
          }

          if (isAuth && navItem.link !== "/pricing-plan") {
            return null; // Hide links for logged-in users except "/pricing-plan"
          }

          return (
            <Link
              key={index}
              href={navItem.link}
              className={cn(
                "text-white hover:text-gray-300 px-2 py-1 rounded-md transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                isActive ? "underline underline-offset-4 text-orange-400" : ""
              )}
            >
              {navItem.linkName}
            </Link>
          );
        })}
      </div>

      {/* Optional section on the right */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="md:flex items-center gap-2 hidden">
            {/* Add any other elements here */}
          </div>
        </div>
      </div>
    </div>
  );
};
