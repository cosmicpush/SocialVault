export function Footer() {
  return (
    <footer className="mt-auto bg-white/70 backdrop-blur-2xl border-t border-white/60 shadow-inner">
      <div className="container mx-auto flex flex-col items-center gap-3 px-4 py-8 text-center text-slate-600">
        <div className="h-1 w-24 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 animate-gradient"></div>
        <p className="text-sm font-semibold tracking-wide">
          Crafted with care by Devashish Sharma
        </p>
        <p className="text-xs text-slate-500">
          Keeping every vault secure, sparkly, and joyful ✨
        </p>
      </div>
    </footer>
  )
}
