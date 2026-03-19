import { MoveLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ShoppingCenter() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-8 text-center sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/task-center')}
          className="self-start inline-flex items-center gap-2 rounded-full border border-white/10 bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-400"
        >
          <MoveLeft size={18} />
          Task Center
        </button>

        <div className="mt-16 text-6xl" aria-hidden="true">
          🚧
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-100">
          Shopping Center
        </h1>
        <p className="mt-3 text-base text-slate-400">
          Coming Soon — We&apos;re working on something great
        </p>
      </div>
    </div>
  )
}
