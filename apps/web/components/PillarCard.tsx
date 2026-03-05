type PillarCardProps = {
  title: string
  desc: string
  bg: string
  img: string
  blendMode?: string
  textColor?: string
  imgPadding?: string
}

export default function PillarCard({
  title,
  desc,
  bg,
  img,
  blendMode = "mix-blend-overlay",
  textColor = "text-gray-900 dark:text-white",
  imgPadding = "bg-white/20"
}: PillarCardProps) {
  return (
    <div className={`flex-none w-[350px] h-[480px] ${bg} rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden group border border-white/20 shadow-xl`}>
      <div className="relative z-10">
        <h3 className={`text-2xl font-bold ${textColor.split(' ')[0]} dark:text-white mb-4`}>
          {title}
        </h3>
        <p className={`${textColor.includes('gray-700') ? 'text-gray-700' : 'text-gray-300'} dark:text-gray-300 leading-relaxed`}>
          {desc}
        </p>
      </div>

      <div className="flex justify-end mt-auto">
        <div className={`p-4 ${imgPadding} rounded-full backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={title}
            className={`w-20 h-20 object-cover rounded-full ${blendMode} opacity-90`}
            src={img}
          />
        </div>
      </div>
    </div>
  )
}