"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function ProfileSection({ companyId }: { companyId: string }) {
    const [profile] = trpc.companies.companyProfile.useSuspenseQuery({ companyId });

    const { userId} = useAuth();
    console.log(profile)
    return (
        <>
            <div className="mb-10">

                {/* Company Header */}
                <div className="bg-[#2d4356] text-white pb-16">
                    <div className="container mx-auto px-4">
                        <div className="flex md:flex-row items-center justify-between pt-8">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <Image
                                    src={profile.logoUrl ?? "/vercel.svg"}
                                    alt={profile.companyName}
                                    width={64}
                                    height={64}
                                    className="h-20 w-20 rounded-full p-2"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold">{profile.companyName}</h1>
                                    <a href="#" className="text-sm text-gray-300">{profile.websiteUrl}</a>
                                </div>
                            </div>
                            {
                                userId === profile.clerkId && (
                                    <Button variant="ghost" className="text-white" asChild>
                                        <Link href="/profile">
                                        <Edit2 className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )
                            }
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="space-y-2">
                                <p className="flex items-center"><span className="text-gray-300">Name:</span> {profile.companyName}</p>
                                <p><span className="text-gray-300">Sector:</span> {profile.sectorName}</p>
                                <p><span className="text-gray-300">City:</span> {profile.countryName}, {profile.stateName}</p>
                            </div>
                            <div className="space-y-2">
                                {/* <p><span className="text-gray-300">Address:</span> {profile.address}</p> */}
                                <p><span className="text-gray-300">Phone number:</span> {profile.phoneNumber}</p>
                                <p><span className="text-gray-300">Email:</span> {profile.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Content */}
                <div className="container mx-auto px-4 mt-10">
                    <div className="space-y-6">
                        {/* Description Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <h2 className="text-xl font-semibold">Description</h2>
                                <Button variant="ghost" size="icon">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground mb-4">
                                    {profile.presentation}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

        </>
    )
}