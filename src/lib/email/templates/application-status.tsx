import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import { BaseTemplate } from './base-template'

interface ApplicationStatusEmailProps {
  developerName: string
  projectTitle: string
  companyName: string
  status: 'accepted' | 'rejected'
  projectUrl: string
}

export const ApplicationStatusEmail = ({
  developerName,
  projectTitle,
  companyName,
  status,
  projectUrl,
}: ApplicationStatusEmailProps) => {
  const isAccepted = status === 'accepted'
  
  const preview = isAccepted
    ? `Great news! Your application for ${projectTitle} has been accepted`
    : `Update on your application for ${projectTitle}`

  return (
    <BaseTemplate preview={preview}>
      <Text className="text-black text-[14px] leading-[24px]">
        Hi {developerName},
      </Text>

      {isAccepted ? (
        <>
          <Text className="text-black text-[14px] leading-[24px]">
            🎉 <strong>Congratulations!</strong> We have great news for you.
          </Text>

          <Text className="text-black text-[14px] leading-[24px]">
            Your application for the project <strong>&ldquo;{projectTitle}&rdquo;</strong> at{' '}
            <strong>{companyName}</strong> has been <span className="text-green-600 font-semibold">accepted</span>!
          </Text>

          <Text className="text-black text-[14px] leading-[24px]">
            The company was impressed with your profile and experience. They will be reaching out to you soon with next steps and project details.
          </Text>

          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              href={projectUrl}
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            >
              View Project Details
            </Button>
          </Section>

          <Text className="text-black text-[14px] leading-[24px]">
            This is a great opportunity to showcase your skills and build something amazing. Good luck with the project!
          </Text>
        </>
      ) : (
        <>
          <Text className="text-black text-[14px] leading-[24px]">
            Thank you for your interest in the project <strong>&ldquo;{projectTitle}&rdquo;</strong> at{' '}
            <strong>{companyName}</strong>.
          </Text>

          <Text className="text-black text-[14px] leading-[24px]">
            After careful consideration, they have decided to move forward with other candidates for this particular role.
          </Text>

          <Text className="text-black text-[14px] leading-[24px]">
            We know this isn&apos;t the outcome you were hoping for, but don&apos;t let it discourage you. There are many other exciting opportunities waiting for you on our platform.
          </Text>

          <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              href="https://hirethecode.com/projects"
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            >
              Browse More Projects
            </Button>
          </Section>

          <Text className="text-black text-[14px] leading-[24px]">
            Keep refining your profile, continue applying, and your perfect match is just around the corner!
          </Text>
        </>
      )}
    </BaseTemplate>
  )
}