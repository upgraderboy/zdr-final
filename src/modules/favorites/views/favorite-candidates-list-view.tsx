"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateCard } from "@/modules/candidates/ui/components/candidate-card/CandidateCard";
import { trpc } from "@/trpc/client";
import { Search } from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDebounce } from "use-debounce"; // 👈 install this

export default function FavoriteCandidatesView() {


    return (

        <Suspense fallback={<FavoriteCandidateSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <FavoriteCandidates />
            </ErrorBoundary>
        </Suspense>
    );
}


export function FavoriteCandidateSkeleton() {
    return (
        <div>
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-4 p-6 border rounded-lg">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FavoriteCandidates() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 400); // ⏳ delay query

    const [sortBy, setSortBy] = useState<"name" | "createdAt">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [data] = trpc.favorites.getFavoriteCandidates.useSuspenseQuery({
        search: debouncedSearch,
        sortBy,
        sortOrder,
    });
    return (
        <div className="">
            {/* 🔍 Search and Sort Controls */}
            <div className="relative h-[400px] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/10 z-10" />
                <Image
                    src="/View Candidates.jpg"
                    alt="Business professionals"
                    width={1000}
                    height={1000}
                    className="absolute inset-0 w-full h-full object-fit"
                />

                <div className="w-full relative z-20 flex flex-col items-center text-center space-y-8 px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">View Candidates</h1>
                    <div className="max-w-2xl w-full relative flex items-center bg-white rounded-full overflow-hidden">
                        <Input
                            placeholder="Search companies..."
                            value={searchQuery}
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
            <div className="w-full container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
            </div>
        </div>
    );
}