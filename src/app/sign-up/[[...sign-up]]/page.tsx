import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-gray-500 mt-2">
            Join Hire the Code today
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white shadow-sm border border-gray-200 rounded-2xl p-8',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton:
                'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl h-12 transition-all duration-200',
              socialButtonsBlockButtonText: 'font-medium',
              dividerLine: 'bg-gray-200',
              dividerText: 'text-gray-400 text-sm',
              formFieldLabel: 'text-gray-700 font-medium text-sm',
              formFieldInput:
                'rounded-xl border-gray-200 h-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
              formButtonPrimary:
                'bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl h-12 transition-all duration-200',
              footerActionLink: 'text-blue-500 hover:text-blue-600 font-medium',
              identityPreviewEditButton: 'text-blue-500 hover:text-blue-600',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },
          }}
        />
      </div>
    </div>
  )
}
