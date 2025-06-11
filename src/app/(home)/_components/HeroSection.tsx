export function HeroSection({title, description}: {title: string; description: string}) {
  return (
    <section className="relative h-[400px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/partnership_hero.png?height=500&width=1920')`,
        }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative container mx-auto px-4 py-24 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="light:text-gray-400 text-4xl md:text-5xl font-serif">
            {title}
          </h1>
          <p className="light:text-gray-400 text-lg md:text-xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
