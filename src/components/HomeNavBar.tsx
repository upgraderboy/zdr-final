"use client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { NavLinks } from "@/components/NavLinks"
import { AuthButton } from "@/modules/auth/components/auth-button"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
// import { ModeToggle } from "@/components/ui/ModeToggle"
import { Roles } from "../../types/globals";
export const HomeNavBar = ({ role }: { role?: Roles }) => {
    const isMobile = useIsMobile();
    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-700 flex items-center px-2 pr-5 z-50">
            <div className="flex justify-between items-center gap-4 w-full">
                {/* Menu and Logo */}
                <div className="flex items-center flex-shrink-0">
                {
                        isMobile ? (
                            role && (
                                <SidebarTrigger defaultChecked={false} />
                            )
                        ) : role && (
                            <SidebarTrigger defaultChecked={false} />
                        )
                    }
                    <Link href="/">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
                            <p className="text-lg font-bold text-white">ZDAR</p>
                        </div>
                    </Link>
                </div>
                {/* Search Bar */}
                <div className="flex-1 justify-end hidden md:flex">
                    <NavLinks role={role} />
                </div>
                {/* Notifications */}
                {/* <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Bell className="size-4" />
                    </button>
                </div> */}
                <div className="flex flex-row items-center gap-4">
                {/* <ModeToggle /> */}
                <div className="flex-1 flex justify-center max-w-[720px]">
                <Button className="px-6 bg-orange-600 hover:bg-orange-700" asChild>
                    <Link href={"/contact"}>Contact</Link>
                </Button>
                </div>
                <div className="flex-shrink-0 items-center flex gap-4">
                    <AuthButton />
                </div>
                </div>
            </div>
        </nav>
    )
}