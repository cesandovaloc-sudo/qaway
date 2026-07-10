import { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const IMAGES = [
  'assets/pages/1-inicio/inicio_hero_mockup1.webp',
  'assets/pages/1-inicio/inicio_hero_mockup2.webp',
  'assets/pages/1-inicio/inicio_hero_mockup3.webp',
]

function StackedImage({ src, mouseX, mouseY, index, total }) {
  const depth = total - index
  const tilt = 8 + depth * 5
  const spreadX = 6 + index * 6
  const spreadY = 4 + index * 4

  const rotateY = useTransform(mouseX, [-0.5, 0.5], [tilt, -tilt])
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [-tilt, tilt])
  const x = useTransform(mouseX, [-0.5, 0.5], [-spreadX, spreadX])
  const y = useTransform(mouseY, [-0.5, 0.5], [-spreadY, spreadY])

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex: total - index,
        rotateX,
        rotateY,
        x,
        y,
        scale: 1 - index * 0.04,
      }}
      initial={{
        x: index * 6,
        y: index * 6,
      }}
    >
      <div className="w-full h-full rounded-2xl overflow-hidden border border-white/15 shadow-lg bg-black">
        <img
          src={`${import.meta.env.BASE_URL}${src}`}
          alt={`Imagen ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </motion.div>
  )
}

export function StackedCarousel() {
  const ref = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(cx)
    mouseY.set(cy)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full"
    >
      {IMAGES.map((src, i) => (
        <StackedImage
          key={src}
          src={src}
          mouseX={mouseX}
          mouseY={mouseY}
          index={i}
          total={IMAGES.length}
        />
      ))}
    </div>
  )
}
