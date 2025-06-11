import Hero from "@/app/(home)/_components/Hero";
import RegisterBtn from "@/app/(home)/_components/RegisterBtn";
export const dynamic = 'auto'
const Page = () => {;
  return (
    <>
      <div className="min-h-screen ">

        <Hero />
        {/* <Testimonials /> */}
        {/* <Stats /> */}

        <RegisterBtn />
      </div>
    </>
  );
}
export default Page;