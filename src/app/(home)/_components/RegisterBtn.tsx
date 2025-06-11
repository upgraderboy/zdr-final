import { Button } from '@/components/ui/button';
import Link from 'next/link';





const RegisterBtn = () => {
  return (
    <div className="container md:mx-auto flex flex-col md:flex-row justify-center items-center md:gap-[4rem] gap-2 py-16 px-4">
      <Button className='w-full md:w-[calc(50%-2rem)] bg-[#2B4356] hover:bg-[#2B4356]/90 text-white'>
        <Link href={'/sign-up'}>Start Hiring Now</Link>
      </Button>
      <Button className='w-full md:w-[calc(50%-2rem)] bg-orange-600 hover:bg-orange-600/90 text-white'>
        <Link href={'/sign-up'}>Find Your Job Oportunities</Link>
      </Button>
    </div>
  )
}
export default RegisterBtn;