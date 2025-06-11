import Image from "next/image";

const ServicesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6 mx-auto">
        {/* For Companies Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#ff4500]">For Companies</h2>
            <p className="light:text-gray-700 dark:text-gray-400 leading-relaxed">
              Zdar equips businesses with an intuitive platform to search for and connect with the right talent. Our advanced AI tools and filtering systems allow companies to refine their search for candidates based on specific needs, ensuring they aren&apos;t overwhelmed by irrelevant profiles. This results in faster and more precise hiring decisions, saving both time and budget. Additionally, companies have access to analytical and statistical dashboards, offering detailed insights and reports based on our secure, constantly updated database. These dashboards provide key metrics that help improve talent acquisition strategies and decision-making.
            </p>
          </div>
          <div className="relative">
            <Image
              src="/service_1.png?height=400&width=600"
              width={1000}
              height={1000}
              alt="Employment Platform Interface"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        {/* For Candidates Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <Image
              src="/service_2.png?height=400&width=600"
              width={1000}
              height={1000}
              alt="Candidate Selection Process"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl font-bold text-[#ff4500]">For Candidates</h2>
            <div className="space-y-4">
              <p className="light:text-gray-700 dark:text-gray-400 leading-relaxed">
                Job seekers benefit from a personalized experience, where their skills are matched with companies looking for their specific expertise. Zdar&apos;s platform ensures that candidates are visible to companies, actively searching for professionals like them. Our system is designed to optimize every profile and highlight the most relevant opportunities.
              </p>
              <p className="light:text-gray-700 dark:text-gray-400 leading-relaxed">
                Both environments leverage powerful query tools, allowing users to access the most relevant, up-to-date information from our secure database. Whether you&apos;re a company or a candidate, Zdar gives you the tools and insights needed to succeed in today&apos;s competitive job market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default ServicesSection;