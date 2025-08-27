import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface BaseTemplateProps {
  preview: string
  children: React.ReactNode
}

export const BaseTemplate = ({ preview, children }: BaseTemplateProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans px-2">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
          {/* Header */}
          <Section className="mt-[32px]">
            <Img
              src="https://hirethecode.com/logo.png"
              width="40"
              height="37"
              alt="Hire the Code"
              className="my-0 mx-auto"
            />
          </Section>
          
          <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
            <strong>Hire the Code</strong>
          </Heading>

          {/* Content */}
          {children}

          {/* Footer */}
          <Section className="mt-[32px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Best regards,<br />
              The Hire the Code Team
            </Text>
          </Section>

          <Section className="mt-[32px]">
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This email was sent to you because you have an account with Hire the Code.
              If you no longer wish to receive these emails, you can{' '}
              <Link
                href="https://hirethecode.com/unsubscribe"
                className="text-blue-600 no-underline"
              >
                unsubscribe here
              </Link>
              .
            </Text>
          </Section>

          <Section className="mt-[16px]">
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
              © 2024 Hire the Code. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)