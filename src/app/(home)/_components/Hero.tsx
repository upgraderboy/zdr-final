import { Play } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-4">
    <div className="max-w-7xl mx-auto text-center">
      <h1 className="leading-tight mb-8 text-justify">
      In a world full of data, we bring clarity through ZDAR&apos;s intelligent platform
powered by AI and advanced analytics — enabling smarter connections between recruiters and top-tier
talent.
      </h1>
    </div>
    <div className="relative mx-auto">
    <Image src='/home.png' width={1200} height={100} alt='home' />
    <span className="absolute top-[20%] md:top-[42%] right-[50%]">
      <Play className='bg-primary rounded-full p-1' size={40} />
    </span>
    </div>
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <Image src="/orange_logo.png" width={100} height={100} alt="Logo" className='w-10 h-10' />
        <span className='font-[700]'>ZDAR</span>
      </div>
      <div className="">Connecting Skills With Opportunities</div>
    </div>
    </div>
  </section>
  )
}
export default Hero;