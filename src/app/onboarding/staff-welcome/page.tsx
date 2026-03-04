'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, Clock, FileText, ArrowRight, Star, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/ui/page-layout';
import { GlassCard, GlassButton, GlassIconBadge } from '@/components/ui/glass-card';

export default function StaffWelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard/staff');
  };

  const features = [
    {
      icon: Clock,
      title: 'Cash Sessions',
      description: 'Track opening and closing balances for your shifts',
      color: 'blue',
    },
    {
      icon: FileText,
      title: 'Petty Vouchers',
      description: 'Log expenses and maintain proper records',
      color: 'amber',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your restaurant team',
      color: 'emerald',
    },
    {
      icon: Star,
      title: 'Performance Tracking',
      description: 'Monitor daily operations and performance metrics',
      color: 'purple',
    },
  ];

  const colorStyles: Record<string, { bg: string; border: string; icon: string }> = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
    },
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-xl flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/logo.svg"
              alt="Restaurant Daily"
              width={40}
              height={40}
              className="w-10 h-10 mr-3"
            />
            <span className="text-2xl font-bold text-white">Restaurant Daily</span>
          </div>

          <div className="flex justify-center mb-4">
            <GlassIconBadge icon={<Users className="h-10 w-10" />} variant="info" size="lg" glow />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome to the Team!
          </h1>

          <p className="text-white/60">
            You&apos;re all set to start tracking daily operations
          </p>
        </div>

        {/* Main Content */}
        <GlassCard size="lg" variant="info" className="flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              What you can do as a team member
            </h2>
          </div>

          {/* Features Grid */}
          <div className="space-y-4 mb-8 flex-1">
            {features.map((feature) => {
              const style = colorStyles[feature.color];
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors"
                >
                  <div className={`p-2.5 ${style.bg} rounded-xl border ${style.border}`}>
                    <Icon className={`h-6 w-6 ${style.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/50 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <GlassButton
              onClick={handleGetStarted}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25 hover:shadow-blue-500/40"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Get Started
            </GlassButton>
          </div>
        </GlassCard>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/40">
            Need help getting started? Your restaurant admin can guide you through the features.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
