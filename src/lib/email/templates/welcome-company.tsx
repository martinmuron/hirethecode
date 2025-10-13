import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import { BaseTemplate } from './base-template'

interface WelcomeCompanyEmailProps {
  companyName: string
  profileUrl: string
}

export const WelcomeCompanyEmail = ({
  companyName,
  profileUrl,
}: WelcomeCompanyEmailProps) => {
  const preview = `Welcome to Hire the Code, ${companyName}! 🚀`

  return (
    <BaseTemplate preview={preview}>
      <Text className="text-black text-[14px] leading-[24px]">
        Hi {companyName},
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        🎉 <strong>Welcome to Hire the Code!</strong> We&apos;re thrilled to have you join our community of talented developers.
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        You&apos;re now part of an exclusive platform where top companies such as yours come to find exceptional developers. Here&apos;s what you can do to get started:
      </Text>

      <Section className="mt-[24px] mb-[24px]">
        <Text className="text-black text-[14px] leading-[24px] mb-2">
          <strong>✅ Complete Your Profile</strong><br />
          Add the projects that you want to find developers for.
        </Text>
        
        <Text className="text-black text-[14px] leading-[24px] mb-2">
          <strong>🔍 Browse Developers</strong><br />
          Browse our database of talent.
        </Text>
        
        <Text className="text-black text-[14px] leading-[24px]">
          <strong>🤝 Connect</strong><br />
          Reach out directly to developers you feel will suit your projects' needs.
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

      <Text className="text-black text-[14px] leading-[24px]">
        Ready to take your company to the next level? Let&apos;s build something amazing together! 🚀
      </Text>
    </BaseTemplate>
  )
}
