import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
});


export default function MapPage() {
  return (
    <main className="min-h-screen bg-[#060f0e] text-white">

      {/* NAVBAR */}
      <header className="border-b border-white/10 bg-[#071312]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">

          <a
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            Civic<span className="text-[#38d4c8]">Track</span>
          </a>

          <div className="flex items-center gap-3">

            <a
              href="/"
              className="hidden rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Home
            </a>

            <a
              href="/report"
              className="rounded-full bg-[#159b91] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#18afa4]"
            >
              + Report issue
            </a>

          </div>

        </div>
      </header>

      {/* MAP SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">

        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#48cec3]">
            CivicTrack Map
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Explore your city.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
            Discover civic issues near you and see what your
            community is reporting.
          </p>
        </div>

        <div className="relative h-[600px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">

         <MapClient />

        </div>

      </section>
    </main>
  );
}