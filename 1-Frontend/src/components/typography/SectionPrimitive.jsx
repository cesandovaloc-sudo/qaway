import Kicker from './Kicker'
import SectionHeading from './SectionHeading'
import BodyText from './BodyText'

export default function SectionPrimitive({
  kicker,
  title,
  body,
  cta,
  uppercase = false,
  titleClassName = '',
  className = '',
}) {
  return (
    <div className={className}>
      {kicker && <Kicker className="mb-5">{kicker}</Kicker>}
      <SectionHeading size="default" tracking="-0.055em" leading="0.87" className={uppercase ? 'uppercase' : titleClassName}>
        {title}
      </SectionHeading>
      {body && (
        <BodyText className="mt-4 max-w-md">
          {body}
        </BodyText>
      )}
      {cta && (
        <div className="mt-6">
          {cta}
        </div>
      )}
    </div>
  )
}
