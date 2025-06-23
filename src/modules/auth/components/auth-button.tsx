"use client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SignedIn, SignedOut, useAuth, UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"

import { useState } from "react"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { SignIn } from "@clerk/nextjs"
import { DollarSign } from "lucide-react"
export const AuthButton = () => {
    const { isLoaded } = useUser();
    const { sessionClaims } = useAuth();
    const [open, setOpen] = useState(false);
    // !isSignedIn ? (
    //     <Skeleton className="px-12 py-6 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none [&_svg]:size-4 border" />
    // ) : 

    if (!isLoaded) {
        return (
            <>
                {
                    (
                        <Skeleton className="h-9 w-9 rounded-full bg-blue-600 border" />
                    )
                }
            </>
        )
    }

    return (
        <>
            <SignedIn>
                <UserButton>
                    {
                        sessionClaims?.metadata?.role === "COMPANY" ? (
                            <UserButton.MenuItems>
                                <UserButton.Link href="/pricing-plan" label="Pricing Plan" labelIcon={<DollarSign />} />
                            </UserButton.MenuItems>
                        ) : (
                            <UserButton.MenuItems>
                                <UserButton.Link href="/pricing-plan" label="Pricing Plan" labelIcon={<DollarSign />} />
                            </UserButton.MenuItems>
                        )
                    }
                </UserButton>
            </SignedIn>
            <SignedOut>
            <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="px-6 text-white hover:bg-transparent hover:text-white" onClick={() => setOpen(true)}>
          Log In
        </Button>
      </DialogTrigger>

      <DialogContent className="w-auto bg-transparent p-0 flex items-center justify-center">
        <SignIn
          appearance={{
            elements: {
                modalBody: 'flex flex-col gap-4',
                footer: 'hidden',
            },
          }}
          routing="hash"
          signUpUrl="/sign-up"
        />
      </DialogContent>
    </Dialog>
            </SignedOut>
        </>
    )
}