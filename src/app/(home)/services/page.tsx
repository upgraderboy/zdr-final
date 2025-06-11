import ServicesSection from "./_components/ServicesSection";
import { HeroSection } from "../_components/HeroSection";


const ServicesPage = () => {
  return (
    <div className="flex-1">
        <HeroSection title="Services" description="Zdar provides services." />
        <ServicesSection />
      </div>
  )
}
export default ServicesPage;