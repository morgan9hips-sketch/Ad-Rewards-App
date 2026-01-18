interface Avatar {
  id: string
  emoji: string
  name: string
}

const presetAvatars: Avatar[] = [
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'tiger', emoji: '🐯', name: 'Tiger' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'koala', emoji: '🐨', name: 'Koala' },
  { id: 'frog', emoji: '🐸', name: 'Frog' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
  { id: 'robot', emoji: '🤖', name: 'Robot' },
  { id: 'alien', emoji: '👾', name: 'Alien' },
  { id: 'controller', emoji: '🎮', name: 'Gamer' },
  { id: 'target', emoji: '🎯', name: 'Target' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning' },
]

interface AvatarSelectorProps {
  selected: string | null
  onSelect: (emoji: string) => void
}

export default function AvatarSelector({ selected, onSelect }: AvatarSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Choose Your Avatar
      </label>
      <div className="grid grid-cols-5 gap-3">
        {presetAvatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.emoji)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${
                selected === avatar.emoji
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }
            `}
            title={avatar.name}
          >
            <span className="text-3xl">{avatar.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
