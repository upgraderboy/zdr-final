"use client"
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ProfileForm from "../ui/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileFormSection = () => {
    return (
        <Suspense fallback={<ProfileFormSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ProfileFormSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}
const ProfileFormSkeleton = () => {
    return (
        <>
            <div className="space-y-8 max-w-3xl py-10">
                {/* Company Logo Skeleton */}
                <div className="space-y-2">
                    <div className="text-sm font-medium">Company Logo</div>
                    <Skeleton className="h-[84px] w-[153px] rounded-md" />
                </div>

                {/* Website & Company Name */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="col-span-6">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>

                {/* Sector */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-[200px] rounded-md" />
                </div>

                {/* Country and State Selector */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-14 w-full rounded-md" />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="col-span-6">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>

                {/* Gender, First Name, Last Name */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="col-span-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="col-span-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>

                {/* Company Presentation */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-24 w-full rounded-md" />
                </div>

                {/* Submit Button */}
                <div>
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>
        </>
    )
}
const ProfileFormSectionSuspense = () => {
    const [profile, { isPending }] = trpc.companies.getProfile.useSuspenseQuery()
    return <ProfileForm profile={{
        ...profile,
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        companyName: profile.companyName ?? "",
        sectorName: profile.sectorName ?? "",
        countryName: profile.countryName ?? "",
        stateName: profile.stateName ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        email: profile.email ?? "",
        gender: profile.gender ?? "",
        presentation: profile.presentation ?? "",
        websiteUrl: profile.websiteUrl ?? "",
        logoUrl: profile.logoUrl ?? "",
        lat: profile.lat ?? 0,
        lng: profile.lng ?? 0,
    }} isPending={isPending} />
}