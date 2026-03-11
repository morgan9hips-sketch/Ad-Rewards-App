interface RewardCardProps {
  title: string
  description: string
  rewardLabel: string
  imageSrc: string
  imageAlt: string
  actionLabel?: string
  onAction?: () => void
  hero?: boolean
}

export default function RewardCard({
  title,
  description,
  rewardLabel,
  imageSrc,
  imageAlt,
  actionLabel = 'Start Earning',
  onAction,
  hero = false,
}: RewardCardProps) {
  return (
    <div className="rounded-[12px] border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm">
      <div className="relative overflow-hidden rounded-[12px] border border-slate-800 bg-slate-950">
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`w-full object-contain ${hero ? 'h-56 p-5' : 'h-40 p-4'}`}
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/60" />

        <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">
          {rewardLabel}
        </span>

        <button
          type="button"
          onClick={onAction}
          className={`absolute bottom-4 left-4 inline-flex items-center rounded-full border border-white/10 bg-blue-500 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-md ${
            hero ? 'px-8 py-2' : 'px-6 py-2'
          }`}
        >
          {actionLabel}
        </button>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  )
}
