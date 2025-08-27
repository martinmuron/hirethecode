import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import { BaseTemplate } from './base-template'

interface WelcomeDeveloperEmailProps {
  developerName: string
  profileUrl: string
}

export const WelcomeDeveloperEmail = ({
  developerName,
  profileUrl,
}: WelcomeDeveloperEmailProps) => {
  const preview = `Welcome to Hire the Code, ${developerName}! 🚀`

  return (
    <BaseTemplate preview={preview}>
      <Text className="text-black text-[14px] leading-[24px]">
        Hi {developerName},
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        🎉 <strong>Welcome to Hire the Code!</strong> We&apos;re thrilled to have you join our community of talented developers.
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        You&apos;re now part of an exclusive platform where top companies come to find exceptional developers like yourself. Here&apos;s what you can do to get started:
      </Text>

      <Section className="mt-[24px] mb-[24px]">
        <Text className="text-black text-[14px] leading-[24px] mb-2">
          <strong>✅ Complete Your Profile</strong><br />
          Add your skills, experience, portfolio, and rate to attract the right projects.
        </Text>
        
        <Text className="text-black text-[14px] leading-[24px] mb-2">
          <strong>🔍 Browse Projects</strong><br />
          Explore exciting opportunities from companies actively hiring.
        </Text>
        
        <Text className="text-black text-[14px] leading-[24px] mb-2">
          <strong>💬 Get Discovered</strong><br />
          Companies can find and contact you directly based on your profile.
        </Text>
        
        <Text className="text-black text-[14px] leading-[24px]">
          <strong>🤝 Apply & Connect</strong><br />
          Apply to projects that match your interests and start meaningful conversations.
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
        <strong>Pro Tip:</strong> Developers with complete profiles get 3x more project invitations. Take a few minutes to showcase your best work!
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        Ready to take your freelance career to the next level? Let&apos;s build something amazing together! 🚀
      </Text>
    </BaseTemplate>
  )
}