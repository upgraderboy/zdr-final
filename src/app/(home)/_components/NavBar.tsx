import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';





// Navigation
const NavBar = async () => {
  const user = null;
  const navbarLinks = [
    { linkName: 'Home', link: '/' },
    { linkName: 'About', link: '/about' },
    { linkName: 'Services', link: '/services' },
    { linkName: 'Partnerships & Media', link: '/partnership-media' },
    { linkName: 'Pricing Plan', link: '/pricing-plan' }
  ];
  return (
    <nav className="bg-[#2B4356] text-white sticky top-0 z-10">
      <div className="container w-[90vw] mx-auto flex items-center justify-between h-16">
        <Link href={"/"} className='flex items-center'>
          <Image src="/logo.png" alt="ZDAR" width={100} height={40} className="h-10 w-auto" />
          <span className="font-semibold text-2xl">ZDHAR</span>
        </Link>
        <div className="flex items-center gap-6 ">
          <div className="hidden md:flex gap-10 items-center">
            {navbarLinks.map((navItem, index) => (
              <Link
                key={index}
                href={navItem.link}
                className="text-white hover:text-gray-300"
              >
                {navItem.linkName}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <Button className="px-6"><Link href={"/contact"}>Contact</Link></Button>
            <div className="flex items-center gap-4">
              <div className="md:flex items-center gap-2 hidden">


              </div>
              {!user ? <></> : (
                <Link href="/auth/login">
                  Login
                </Link>)}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
export default NavBar;