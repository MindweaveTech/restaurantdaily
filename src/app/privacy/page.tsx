'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Share2, AlertTriangle, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  const dataRights = [
    {
      icon: Eye,
      title: 'Right to Access',
      description: 'Request a copy of your personal data we hold'
    },
    {
      icon: FileText,
      title: 'Right to Correction',
      description: 'Request correction of inaccurate or incomplete data'
    },
    {
      icon: Lock,
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data'
    },
    {
      icon: UserCheck,
      title: 'Right to Withdraw Consent',
      description: 'Withdraw consent for data processing at any time'
    },
    {
      icon: Share2,
      title: 'Right to Data Portability',
      description: 'Receive your data in a structured, common format'
    },
    {
      icon: AlertTriangle,
      title: 'Right to Grievance Redressal',
      description: 'File complaints regarding data processing'
    }
  ];

  const sections = [
    {
      title: '1. Data Fiduciary Information',
      content: `Mindweave Technologies Pvt. Ltd. ("we", "us", "our") is the Data Fiduciary responsible for processing your personal data under the Digital Personal Data Protection Act, 2023 (DPDPA).

Contact Details:
Company: Mindweave Technologies Pvt. Ltd.
Email: privacy@mindweave.tech
Address: Bengaluru, Karnataka, India

Data Protection Officer:
Email: dpo@mindweave.tech`
    },
    {
      title: '2. Personal Data We Collect',
      content: `We collect the following categories of personal data:

Account Information:
• Phone number (required for authentication)
• Name (optional, for personalization)
• Role designation (admin, team member)

Business Data:
• Cash session records (opening/closing balances)
• Petty cash voucher details
• Payment transaction records
• Audit logs and activity history

Device Information:
• Device type and browser information
• IP address
• Session tokens and authentication data

Usage Data:
• Feature usage patterns
• Login timestamps
• Application interactions`
    },
    {
      title: '3. Purpose of Data Processing',
      content: `We process your personal data for the following purposes:

Service Delivery:
• Authenticating users via SMS/WhatsApp OTP
• Providing cash tracking and management features
• Generating reports and analytics
• Managing team member access

Security:
• Preventing unauthorized access
• Detecting and preventing fraud
• Maintaining audit trails
• Ensuring data integrity

Communication:
• Sending OTP codes for authentication
• Service updates and notifications
• Support communications

Legal Compliance:
• Responding to legal requests
• Maintaining records as required by law
• Tax and regulatory compliance`
    },
    {
      title: '4. Consent',
      content: `By using Restaurant Daily, you provide consent for the processing of your personal data as described in this policy.

You may:
• Withdraw consent at any time
• Request deletion of your data
• Opt-out of optional communications

Withdrawal of consent may affect your ability to use certain features of the Service.

For team members: Your employer/restaurant administrator has added you to the system. Contact them or us to exercise your data rights.`
    },
    {
      title: '5. Data Retention',
      content: `We retain personal data for:

Active Accounts:
• Account data: Duration of account activity
• Cash session data: 7 years (for financial audit compliance)
• Audit logs: 3 years

After Account Deletion:
• Anonymized analytics: Indefinitely
• Legal records: As required by law
• Backup data: Up to 90 days

You may request early deletion subject to legal retention requirements.`
    },
    {
      title: '6. Data Sharing',
      content: `We may share your data with:

Service Providers:
• Supabase (database hosting)
• Twilio (SMS/WhatsApp OTP delivery)
• Cloud infrastructure providers

Legal Requirements:
• When required by law or court order
• To protect our legal rights
• To prevent fraud or security threats

Business Transfers:
• In case of merger or acquisition
• With appropriate data protection agreements

We do NOT:
• Sell your personal data
• Share data with advertisers
• Use data for unrelated purposes`
    },
    {
      title: '7. Data Security',
      content: `We implement technical and organizational measures including:

Technical Safeguards:
• TLS/HTTPS encryption in transit
• Encrypted database storage
• Secure OTP-based authentication
• Role-based access controls
• Regular security audits

Organizational Measures:
• Employee data protection training
• Access limited to authorized personnel
• Incident response procedures
• Regular security reviews

Despite our best efforts, no system is completely secure. Please protect your account credentials and report any suspicious activity immediately.`
    },
    {
      title: '8. Cross-Border Data Transfer',
      content: `Your data may be processed in countries outside India where our service providers operate. We ensure:

• Adequate data protection measures
• Contractual safeguards with processors
• Compliance with DPDPA requirements

Primary data storage is in India with Supabase's regional infrastructure.`
    },
    {
      title: '9. Data Breach Notification',
      content: `In the event of a personal data breach that poses risk to you, we will:

• Notify the Data Protection Board of India as required
• Inform affected users promptly
• Provide details of the breach and remedial actions
• Assist in mitigating potential harm

Timeline: Notification within 72 hours of becoming aware of a significant breach.`
    },
    {
      title: '10. Children\'s Privacy',
      content: `Restaurant Daily is intended for users 18 years and older. We do not knowingly collect personal data from children.

If you are a parent/guardian and believe your child has provided us with personal data, please contact us immediately for data deletion.`
    },
    {
      title: '11. Cookies and Tracking',
      content: `We use minimal cookies for:

Essential Cookies:
• Authentication session management
• Security tokens
• User preferences

We do not use:
• Third-party advertising cookies
• Social media tracking pixels
• Analytics cookies without consent`
    },
    {
      title: '12. Changes to This Policy',
      content: `We may update this Privacy Policy periodically. We will notify you of significant changes via:

• In-app notifications
• SMS/WhatsApp messages
• Website banner

The "Last Updated" date at the top indicates the latest revision. Continued use of the Service after changes constitutes acceptance.`
    },
    {
      title: '13. Grievance Redressal',
      content: `For privacy-related concerns:

Step 1: Contact our Data Protection Officer
Email: dpo@mindweave.tech
Response Time: Within 30 days

Step 2: If unsatisfied, you may file a complaint with:
Data Protection Board of India
(Contact details to be published by the Government)

We are committed to resolving your concerns promptly and fairly.`
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
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30">
              DPDPA 2023 Compliant
            </span>
          </div>
          <p className="text-neutral-400">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Data Principal Rights */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold">Your Data Rights (DPDPA 2023)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataRights.map((right, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors"
              >
                <right.icon className="w-5 h-5 text-orange-400 mb-3" />
                <h3 className="font-medium mb-1">{right.title}</h3>
                <p className="text-sm text-neutral-400">{right.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@mindweave.tech" className="text-orange-400 hover:underline">
              privacy@mindweave.tech
            </a>
          </p>
        </section>

        {/* Policy Sections */}
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
              <Link href="/privacy" className="text-orange-400 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-orange-400 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
