import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import { BaseTemplate } from './base-template'

interface NewMessageEmailProps {
  recipientName: string
  senderName: string
  senderRole: 'developer' | 'company'
  messagePreview: string
  messageUrl: string
}

export const NewMessageEmail = ({
  recipientName,
  senderName,
  senderRole,
  messagePreview,
  messageUrl,
}: NewMessageEmailProps) => {
  const preview = `New message from ${senderName}`

  return (
    <BaseTemplate preview={preview}>
      <Text className="text-black text-[14px] leading-[24px]">
        Hi {recipientName},
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        You have received a new message from{' '}
        <strong>{senderName}</strong>{' '}
        ({senderRole === 'company' ? 'Company' : 'Developer'}) on Hire the Code.
      </Text>

      <Section className="bg-[#f6f6f6] rounded p-[20px] mt-[16px] mb-[16px]">
        <Text className="text-black text-[14px] leading-[20px] m-0">
          &ldquo;{messagePreview.length > 200 ? messagePreview.substring(0, 200) + '...' : messagePreview}&rdquo;
        </Text>
      </Section>

      <Text className="text-black text-[14px] leading-[24px]">
        Click the button below to view the full message and respond:
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          href={messageUrl}
          className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
        >
          View & Reply to Message
        </Button>
      </Section>

      <Text className="text-black text-[14px] leading-[24px]">
        Don&apos;t keep them waiting - timely responses help build great professional relationships!
      </Text>
    </BaseTemplate>
  )
}