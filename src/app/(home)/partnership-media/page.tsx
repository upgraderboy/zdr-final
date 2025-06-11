import { ApproachSection } from "./_components/ApproachSection";
import { HeroSection } from "../_components/HeroSection";

const PartnerShipPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <HeroSection title={"Partenerships & Media"} description="Zdar believes in the power of partnerships." />
        <ApproachSection />
      </div>
    </div>
  )
}
export default PartnerShipPage;