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
      {kicker && (
        <div style={{ paddingBottom: '32px' }}>
          <Kicker>{kicker}</Kicker>
        </div>
      )}
      <SectionHeading size="default" tracking="-0.055em" leading="0.87" className={uppercase ? 'uppercase' : titleClassName}>
        {title}
      </SectionHeading>
      {body && (
        <div style={{ paddingTop: '24px' }}>
          <BodyText className="max-w-[480px] !text-[#666860] !leading-[1.7] !text-[16px]">
            {body}
          </BodyText>
        </div>
      )}
      {cta && (
        <div style={{ paddingTop: '28px' }}>
          {cta}
        </div>
      )}
    </div>
  )
}
