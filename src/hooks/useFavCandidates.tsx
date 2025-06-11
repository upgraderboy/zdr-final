import { trpc } from "@/trpc/client"
import { useState } from "react"

export function useFavoriteCandidates() {
  const { data: favoriteIds, isLoading } = trpc.favorites.getFavoriteCandidateIds.useQuery()
  const utils = trpc.useUtils();
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(new Set())
  const toggleMutation = trpc.favorites.toggleFavoriteCandidate.useMutation({
    onSuccess(data, variables) {
      utils.favorites.getFavoriteCandidateIds.invalidate();
      utils.favorites.getFavoriteCandidates.invalidate();
      setLocalFavorites((prev) => {
        const newSet = new Set(prev)
        if (data.isFavorite) {
          newSet.add(variables.candidateId)
        } else {
          newSet.delete(variables.candidateId)
        }
        return newSet
      })
    },
  })

  console.log("favoriteIds", favoriteIds)
  console.log("localFavorites", localFavorites)
  const isFavorite = (candidateId: string) =>
    localFavorites.has(candidateId) || favoriteIds?.includes(candidateId)

  const toggleFavorite = (candidateId: string) => {
    toggleMutation.mutate({ candidateId })
  }

  return {
    isFavorite,
    toggleFavorite,
    isLoading,
    isMutating: toggleMutation.isPending,
  }
}