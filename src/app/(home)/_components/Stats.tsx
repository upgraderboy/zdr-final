
// Stats
const Stats = () => {
  return (
    <section className="py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className='md:border-r-2 border-gray-400'>
          <h3 className="text-4xl font-bold text-[#FF4500]">10,000+</h3>
          <p className="">Candidates</p>
        </div>
        <div className='md:border-r-2 border-gray-400'>
          <h3 className="text-4xl font-bold text-[#FF4500]">3,000+</h3>
          <p className="">Companies</p>
        </div>
        <div className='md:border-r-2'>
          <h3 className="text-4xl font-bold text-[#FF4500]">10</h3>
          <p className="">Countries in scope</p>
        </div>
      </div>
    </div>
  </section>
  )
}
export default Stats;