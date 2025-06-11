import { trpc } from "@/trpc/client"
import { useState } from "react"

export function useFavoriteJobs() {
  const { data: favoriteIds, isLoading } = trpc.job.getFavoriteJobIds.useQuery()
  const utils = trpc.useUtils();
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(new Set())
  const toggleMutation = trpc.job.toggleFavoriteJob.useMutation({
    onSuccess(data, variables) {
      utils.job.getFavoriteJobIds.invalidate();
      utils.favorites.getFavoriteJobs.invalidate();
      setLocalFavorites((prev) => {
        const newSet = new Set(prev)
        if (data.isFavorite) {
          newSet.add(variables.jobId)
        } else {
          newSet.delete(variables.jobId)
        }
        return newSet
      })
    },
  })

  const isFavorite = (jobId: string) =>
    localFavorites.has(jobId) || favoriteIds?.includes(jobId)

  const toggleFavorite = (jobId: string) => {
    toggleMutation.mutate({ jobId })
  }

  return {
    isFavorite,
    toggleFavorite,
    isLoading,
    isMutating: toggleMutation.isPending,
  }
}