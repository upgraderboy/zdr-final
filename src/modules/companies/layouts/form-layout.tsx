import Image from "next/image";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto px-4 py-8 md:px-8">
        <h1 className="mb-8 text-2xl font-bold text-[#FF3B00]">Create Your Company&apos;s Account</h1>
        <div className="grid gap-8 md:grid-cols-2">
          {children}
          <div className="hidden md:block h-[70%]">
            <div className="hidden md:block h-[140%]">
              <Image
                src="/register_1.png"
                width={1000}
                height={1000}
                alt="Business meeting"
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}