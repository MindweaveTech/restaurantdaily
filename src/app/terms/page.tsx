'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const sections = [
    {
      title: '1. Agreement to Terms',
      content: `By accessing or using Restaurant Daily ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service. These terms apply to all users including restaurant owners, managers, team members, and administrators.`
    },
    {
      title: '2. Description of Service',
      content: `Restaurant Daily is a restaurant operations management platform that provides:

• Daily cash session tracking and reconciliation
• Petty cash voucher management
• Payment tracking and monitoring
• Team member management with role-based access
• Real-time reporting and analytics
• Phone-based authentication via SMS/WhatsApp OTP
• Audit logging for compliance

The Service is designed specifically for Indian restaurants and food service businesses.`
    },
    {
      title: '3. User Accounts',
      content: `To use the Service, you must:

• Provide a valid phone number for authentication
• Be at least 18 years old or have parental consent
• Provide accurate and complete information
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized access
• Accept responsibility for all activities under your account

You may not share your OTP codes or allow others to access your account.`
    },
    {
      title: '4. Acceptable Use',
      content: `You agree not to:

• Use the Service for any unlawful purpose
• Attempt to gain unauthorized access to systems
• Interfere with or disrupt the Service
• Upload malicious code or harmful content
• Falsify cash records or financial data
• Impersonate other users or team members
• Use the Service for money laundering or fraud
• Violate any applicable laws or regulations

We reserve the right to terminate accounts that violate these terms.`
    },
    {
      title: '5. Financial Data Accuracy',
      content: `Users are solely responsible for:

• The accuracy of cash session opening and closing balances
• Correct recording of petty cash vouchers and expenses
• Accurate payment amount entries
• Maintaining proper documentation for audit purposes
• Compliance with local tax and financial regulations

Restaurant Daily provides tools for data entry and tracking but does not verify the accuracy of user-entered financial information.`
    },
    {
      title: '6. Intellectual Property',
      content: `The Service and its original content, features, and functionality are owned by Mindweave Technologies Pvt. Ltd. and are protected by international copyright, trademark, and other intellectual property laws.

You retain ownership of data you enter into the Service. By using the Service, you grant us a license to store, process, and display your data as necessary to provide the Service.`
    },
    {
      title: '7. Data Security',
      content: `We implement industry-standard security measures including:

• Encrypted data transmission (HTTPS/TLS)
• Secure OTP-based authentication
• Role-based access controls
• Regular security audits
• Secure database storage with Supabase

However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      title: '8. Team Member Access',
      content: `Restaurant owners and administrators can:

• Add team members to their restaurant account
• Assign roles (admin, team member)
• View team member activity and audit logs
• Remove team members from the account
• Set permissions for cash and voucher management

Team members acknowledge that their activities may be monitored for business purposes.`
    },
    {
      title: '9. Service Availability',
      content: `We strive for 99.9% uptime but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to:

• Scheduled maintenance (with advance notice when possible)
• Emergency repairs
• Factors beyond our control (internet outages, server issues)

We are not liable for any losses resulting from Service unavailability.`
    },
    {
      title: '10. Fees and Payment',
      content: `Restaurant Daily is currently offered as a free early access service. Future pricing will be communicated in advance.

When paid features are introduced:

• Pricing will be clearly displayed before subscription
• Payment terms will be specified
• Cancellation policies will be provided
• Refund policies will be outlined

We reserve the right to modify pricing with 30 days notice.`
    },
    {
      title: '11. Termination',
      content: `We may terminate or suspend your account immediately, without prior notice, for:

• Breach of these Terms
• Fraudulent activity
• Non-payment (when applicable)
• Extended inactivity
• Request from law enforcement

Upon termination, your right to use the Service will immediately cease. You may request export of your data within 30 days of termination.`
    },
    {
      title: '12. Disclaimer of Warranties',
      content: `THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:

• The Service will meet your specific requirements
• The Service will be uninterrupted or error-free
• Results obtained will be accurate or reliable
• Any errors will be corrected

You use the Service at your own risk.`
    },
    {
      title: '13. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, MINDWEAVE TECHNOLOGIES PVT. LTD. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:

• Loss of profits or revenue
• Loss of data or financial records
• Business interruption
• Costs of substitute services

Our total liability shall not exceed the amount paid by you (if any) in the 12 months preceding the claim.`
    },
    {
      title: '14. Indemnification',
      content: `You agree to defend, indemnify, and hold harmless Mindweave Technologies Pvt. Ltd. and its employees from any claims, damages, losses, or expenses arising from:

• Your use of the Service
• Your violation of these Terms
• Your violation of any third-party rights
• Inaccurate data entered into the Service
• Actions by team members under your account`
    },
    {
      title: '15. Governing Law',
      content: `These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.

If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.`
    },
    {
      title: '16. Changes to Terms',
      content: `We reserve the right to modify these Terms at any time. We will notify users of significant changes via:

• In-app notifications
• SMS/WhatsApp messages
• Email (if provided)

Continued use of the Service after changes constitutes acceptance of the new Terms. We encourage you to review these Terms periodically.`
    },
    {
      title: '17. Contact Us',
      content: `For questions about these Terms of Service, please contact us:

Email: legal@mindweave.tech
Website: https://mindweave.tech
Address: Mindweave Technologies Pvt. Ltd., Bengaluru, Karnataka, India`
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link href="/" className="text-xl font-semibold">
            <span className="text-orange-500">Restaurant</span> Daily
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-neutral-400">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={index} className="prose prose-invert prose-neutral max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
              <div className="text-neutral-300 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Mindweave Technologies Pvt. Ltd.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-neutral-400 hover:text-orange-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-orange-400 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
