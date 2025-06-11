
import { Facebook, Linkedin, MapPin, Mail, Clock, Phone, Twitter } from 'lucide-react'
import Link from 'next/link'



export function ContactSection() {
  return (
    <div className="py-16">
      <div className="">
        {/* Contact Us For */}
        <section className="px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-[#FF4500] mb-8">Contact Us For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-2">1. General inquiries about our platform</h3>
              <h3 className="font-medium mb-2">3. Support for companies and candidates</h3>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. Support for companies and candidates</h3>
              <h3 className="font-medium mb-2">4. Support for companies and candidates</h3>
            </div>
          </div>
        </section>

        {/* Reach Us At */}
        <section className="px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-[#FF4500] mb-8">Reach Us At</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="py-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#FF4500]" />
                  <div className="flex justify-start gap-2">
                    <p className="font-medium">Email:</p>
                    <p>support@zdar.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#FF4500]" />
                  <div className="flex justify-start gap-2">
                    <p className="font-medium">Office hours:</p>
                    <p>Monday – Friday, 9 AM – 6 PM</p>
                  </div>
                </div>
              </div>
              <div className="py-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#FF4500]" />
                  <div className="flex justify-start gap-2">
                    <p className="font-medium">Phone:</p>
                    <p>123-456-7890</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#FF4500]" />
                  <div className="flex justify-start gap-2">
                    <p className="font-medium">Office Location:</p>
                    <p>Zdar HQ, [Your Address]</p>
                    <p>[City, Country]</p>
                  </div>
                </div>
              </div>
          </div>

        </section>
        <section className="pb-10 px-4 sm:px-6 l py-10g:px-8">
        <h2 className="text-2xl font-bold text-[#FF4500] mb-8">Stay Connected</h2>
          <div className="flex space-x-4">
            <Link href="#" className="bg-[#FF4500] p-2 rounded-md hover:bg-[#cc3700] transition-colors">
              <Facebook className="h-6 w-6 text-white" />
            </Link>
            <Link href="#" className="bg-[#FF4500] p-2 rounded-md hover:bg-[#cc3700] transition-colors">
              <Twitter className="h-6 w-6 text-white" />
            </Link>
            <Link href="#" className="bg-[#FF4500] p-2 rounded-md hover:bg-[#cc3700] transition-colors">
              <Linkedin className="h-6 w-6 text-white" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

