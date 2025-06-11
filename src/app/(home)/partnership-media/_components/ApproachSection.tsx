import Image from "next/image";

export function ApproachSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#ff4500]">Our Approach</h2>
            <p className="light:text-gray-700 dark:text-gray-400 leading-relaxed">
              Our approach is rooted in collaboration, both with companies and media outlets, to spread our vision of a
              more streamlined, data-driven approach to recruitment. We work closely with industry leaders, HR
              professionals, and tech innovators to continuously evolve and adapt to the changing employment landscape.
            </p>
          </div>
          <div className="relative">
            <Image
              src="/partnership_1.png?height=400&width=600"
              width={600}
              height={400}
              alt="Team analyzing data visualizations"
              className="rounded-lg shadow-xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

