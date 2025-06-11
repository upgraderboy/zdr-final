import { CandidateWithResume } from "@/modules/candidates/server/procedure";
import { Heart } from "lucide-react";
import { useFavoriteCandidates } from "@/hooks/useFavCandidates";
export const CandidateAction = ({ candidate }: { candidate: CandidateWithResume }) => {
    const { isFavorite, toggleFavorite } = useFavoriteCandidates()
    console.log(isFavorite(candidate.id))
    return (
        <div className="w-full z-40">
            <Heart
                className={`w-4 h-4 absolute top-2 right-4 cursor-pointer ${isFavorite(candidate.id) ? "fill-red-500 text-red-500" : "fill-gray-500 text-gray-500"
                    }`}
                onClick={(e) => {
                    e.stopPropagation(); // <-- Prevents dialog from opening
                    toggleFavorite(candidate.id);
                }}
            />
        </div>
    );
};