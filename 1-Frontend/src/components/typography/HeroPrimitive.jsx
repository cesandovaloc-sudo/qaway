import SectionHeading from './SectionHeading'
import BodyText from './BodyText'

export default function HeroPrimitive({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  className = '',
}) {
  return (
    <div className={`max-w-[34rem] ${className}`}>
      {eyebrow && (
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.015em] text-[#73716d] mb-4">
          {eyebrow}
        </p>
      )}
      <SectionHeading as="h1" size="hero" tracking="-0.055em" leading="0.82">
        {title}
      </SectionHeading>
      {subtitle && (
        <BodyText size="default" className="mt-4 max-w-[34rem]">
          {subtitle}
        </BodyText>
      )}
      {(primaryCta || secondaryCta) && (
        <div className="flex flex-wrap items-center gap-4 mt-8">
          {primaryCta && (
            <a
              href={primaryCta.href}
              className="inline-flex items-center gap-2 text-[0.82rem] font-bold text-white bg-qaway-accent px-6 py-3.5 rounded-xl transition-all duration-300 hover:bg-qaway-accent-light"
            >
              {primaryCta.label}
            </a>
          )}
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#20201f] transition-colors duration-300 hover:text-qaway-accent"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
