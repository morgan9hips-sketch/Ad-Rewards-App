interface RewardCardProps {
  title: string
  description: string
  rewardLabel: string
  imageSrc: string
  imageAlt: string
  actionLabel?: string
  onAction?: () => void
}

export default function RewardCard({
  title,
  description,
  rewardLabel,
  imageSrc,
  imageAlt,
  actionLabel = 'Start Earning',
  onAction,
}: RewardCardProps) {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="relative overflow-hidden rounded-[12px] border border-slate-200 bg-slate-50">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
        <span className="absolute right-3 top-3 rounded-full bg-[#f5af02] px-3 py-1 text-xs font-semibold text-slate-900">
          {rewardLabel}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center rounded-full bg-[#005da4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        {actionLabel}
      </button>
    </div>
  )
}
