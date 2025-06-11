import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Optional helper for conditional class names
import { Roles } from "../../types/globals";

export const NavLinks = ({ role }: { role?: Roles }) => {
  const pathname = usePathname();

  const navbarLinks = [
    { linkName: "Home", link: "/" },
    { linkName: "About", link: "/about" },
    { linkName: "Services", link: "/services" },
    { linkName: "Partnerships & Media", link: "/partnership-media" },
    { linkName: "Pricing Plan", link: "/pricing-plan" },
  ];
  return (
    <div className="flex items-center gap-6">
      <div className="hidden md:flex gap-10 items-center">
        {navbarLinks.map((navItem, index) => {
          const isActive = pathname === navItem.link;
          if(role === "CANDIDATE" && navItem.link === "/pricing-plan") {
            return null;
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
