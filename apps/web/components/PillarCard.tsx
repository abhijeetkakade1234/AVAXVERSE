type PillarCardProps = {
  title: string
  desc: string
  bg: string
  img?: string // Optional now
  icon?: string // Adding back but for the bubble
  blendMode?: string
  textColor?: string
  imgPadding?: string
}

export default function PillarCard({
  title,
  desc,
  bg,
  img,
  icon,
  blendMode = "mix-blend-normal",
  textColor = "text-white",
  imgPadding = "bg-white/10"
}: PillarCardProps) {
  return (
    <div className={`snap-start flex-none w-[320px] h-[450px] ${bg} rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden group border border-white/20 shadow-xl`}>
      <div className="relative z-10">
        <h3 className={`text-3xl font-bold ${textColor} mb-4`}>
          {title}
        </h3>
        <p className={`${textColor} opacity-80 leading-relaxed`}>
          {desc}
        </p>
      </div>

      <div className="flex justify-end mt-auto">
        <div className={`w-28 h-28 ${imgPadding} rounded-full backdrop-blur-md border border-white/30 group-hover:scale-110 transition-all duration-500 shadow-lg flex items-center justify-center`}>
          {img ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={title}
              className={`w-16 h-16 object-contain ${blendMode}`}
              src={img}
            />
          ) : (
            <span className={`material-icons text-white text-6xl drop-shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
              {icon || 'layers'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}