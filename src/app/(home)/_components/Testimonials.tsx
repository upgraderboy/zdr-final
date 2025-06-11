
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image";


// Testimonials
const Testimonials = () => {
  return (
    <section className="py-16 bg-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-[#FF4500] mb-12">They Trust Us</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/10">
            <CardContent className="p-6">
              <p className="mb-4">
              &quot;I&apos;ve been consistently impressed with the quality of service provided by this website. They have exceeded my expectations and delivered exceptional results. Highly recommended!&quot;
              </p>
              <div className="flex items-center">
                <div>
                  <p className="font-semibold">John D.</p>
                  <p className="text-sm text-gray-500">Company CEO</p>
                </div>
                <Image
                  src="/placeholder.svg"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full ml-auto"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
  )
}
export default Testimonials;