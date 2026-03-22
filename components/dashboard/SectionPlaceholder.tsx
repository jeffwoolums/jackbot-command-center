interface SectionPlaceholderProps {
  eyebrow: string
  title: string
  description: string
}

export default function SectionPlaceholder({
  eyebrow,
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <section className="rounded-3xl border border-[#2a2d37] bg-[#1a1d27] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#d4a853]">{eyebrow}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9ca3af]">{description}</p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2d37] bg-black/10 p-4">
          <p className="text-sm text-[#9ca3af]">Status</p>
          <p className="mt-2 text-lg font-medium text-white">Phase 1 placeholder</p>
        </div>
        <div className="rounded-2xl border border-[#2a2d37] bg-black/10 p-4">
          <p className="text-sm text-[#9ca3af]">Next</p>
          <p className="mt-2 text-lg font-medium text-white">Wire live backend data</p>
        </div>
        <div className="rounded-2xl border border-[#2a2d37] bg-black/10 p-4">
          <p className="text-sm text-[#9ca3af]">Operator Note</p>
          <p className="mt-2 text-lg font-medium text-white">Ready for deeper module work</p>
        </div>
      </div>
    </section>
  )
}
