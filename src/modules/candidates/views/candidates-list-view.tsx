"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateCard } from "@/modules/candidates/ui/components/candidate-card/CandidateCard";
import { trpc } from "@/trpc/client";
import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDebounce } from "use-debounce"; // 👈 install this
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CandidateWithResume } from "../server/procedure";

export default function CandidatesView() {

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 400); // ⏳ delay query

    const [sortBy, setSortBy] = useState<"name" | "createdAt">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [data] = trpc.candidates.getAllCandidates.useSuspenseQuery({
        search: debouncedSearch,
        sortBy,
        sortOrder,
    });
    return (
        <div className="">
            {/* 🔍 Search and Sort Controls */}
            <div className="relative h-[400px] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <Image
                    src="/company_view_1.png"
                    alt="Business professionals"
                    width={1000}
                    height={1000}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="w-full relative z-20 flex flex-col items-center text-center space-y-8 px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">View Candidates</h1>
                    <div className="max-w-2xl w-full relative flex items-center bg-white rounded-full overflow-hidden">
                        <Input
                            placeholder="Search Candidates..."
                            value={""}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 border-none outline-none rounded-none bg-white text-black"
                        />
                        <Button className="h-full rounded-none bg-primary text-white px-4" type="submit">
                            <Search color="white" size={24} />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex w-full mb-4">
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center ml-auto mt-4 mr-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "name" | "createdAt")}
                        className="border px-2 py-2 rounded-md"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="createdAt">Sort by Created</option>
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                        className="border px-2 py-2 rounded-md"
                    >
                        <option value="asc">Asc</option>
                        <option value="desc">Desc</option>
                    </select>
                </div>
            </div>

            {/* 📋 Candidate Cards */}

            <Suspense fallback={<CandidatesSkeleton />}>
                <ErrorBoundary fallback={<div>Something went wrong</div>}>
                    <CandidatesSuspense data={data} />
                </ErrorBoundary>
            </Suspense>
        </div>
    );
}
export function CandidatesSuspense({ data }: { data: CandidateWithResume[] }) {


    return (
        <div className="w-full container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
        </div>

    );
}


export const CandidatesSkeleton = () => {
    return (
        <div className="w-full container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
                <div className="w-full p-4" key={index}>
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <Skeleton className="h-48 w-48 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-48 mx-auto mb-2" />
                                <Skeleton className="h-6 w-36 mx-auto" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    );
}