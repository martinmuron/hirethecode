import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import { BaseTemplate } from './base-template'

interface WelcomeSeekerEmailProps {
  seekerName: string
  profileUrl: string
}

export const WelcomeSeekerEmail = ({
  seekerName,
  profileUrl,
}: WelcomeSeekerEmailProps) => {
  const preview = `Welcome to Hire the Code, ${seekerName}! 🚀`

  return (
    <BaseTemplate preview={preview}>
      <Text className="text-black text-[14px] leading-[24px]">
        Hi {seekerName},
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        🎉 <strong>Welcome to Hire the Code!</strong> We&apos;re thrilled to have you join our community.
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        You&apos;re now part of an exclusive platform where people or organizations that have brilliant ideas are matched with developers and companies who can help them realize those ideas. Here&apos;s what you can do to get started:
      </Text>

      <Section className="mt-[24px] mb-[24px]">
        <Text className="text-black text-[14px] leading-[24px] mb-2">
          <strong>✅ Create a few projects</strong><br />
          You can simply type a few sentences describing what you would like to build and our AI will quickly help you find matching developers or companies. Or, if you already know exactly what you want, you can list the skills you need and we'll give you direct matches.
        </Text>
        
        <Text className="text-black text-[14px] leading-[24px] mb-2">
          <strong>🔍 Browse Developers</strong><br />
          You can take a look at our roster of talented developers.
        </Text>
      </Section>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          href={profileUrl}
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
        >
          Complete Your Profile
        </Button>
      </Section>
    </BaseTemplate>
  )
}
