import { TrendingUp, DollarSign, Users, Shield, Clock, CheckCircle, BarChart3, Smartphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-8 sm:py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Image
                src="/logo.png"
                alt="Restaurant Daily Logo"
                width={100}
                height={100}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                priority
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-6 leading-tight">
              Simplify Your Restaurant&apos;s Daily Operations
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 max-w-2xl mx-auto px-2 sm:px-0">
              Stop chasing receipts. Track cash, payments & team in real-time with our mobile-first management platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm md:text-base text-gray-500 mb-6 sm:mb-8 px-2 sm:px-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-center sm:text-left">Secure • Mobile-First • Built for Indian Restaurants</span>
            </div>
            <Link
              href="/auth/phone"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-10 rounded-lg text-base sm:text-lg transition-colors duration-200 shadow-lg w-full sm:w-auto max-w-xs"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 px-2 sm:px-0">
              ✓ No credit card required • ✓ SMS login in 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              Powerful features designed specifically for busy restaurant owners and managers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Daily Cash Reconciliation</h3>
              <p className="text-gray-600 mb-4">Balance your cash drawer in under 2 minutes. Track opening/closing balances, petty cash, and daily variances effortlessly.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Automatic cash counting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Variance tracking & alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Daily session history</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Payment Tracking</h3>
              <p className="text-gray-600 mb-4">Monitor all payment methods in one place. UPI, cards, cash - see exactly where your money is coming from.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Multi-payment tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Daily sales reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Revenue insights</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Management</h3>
              <p className="text-gray-600 mb-4">SMS OTP login means no forgotten passwords. Role-based access keeps your data secure.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>SMS authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Role-based permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Activity audit logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 leading-tight px-2 sm:px-0">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Be up and running in less than 5 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Smartphone className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up with SMS</h3>
                <p className="text-gray-600">Enter your phone number and receive an instant OTP via SMS. No passwords to remember.</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Users className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Up Your Restaurant</h3>
                <p className="text-gray-600">Add your restaurant details and invite team members. Assign roles and permissions in seconds.</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <BarChart3 className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Tracking</h3>
                <p className="text-gray-600">Begin tracking cash sessions, payments, and vouchers immediately. View real-time insights on your phone.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight px-2 sm:px-0">
              Built for Indian Restaurants
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto text-center">
            <div className="bg-orange-50 rounded-lg p-6">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">2 min</div>
              <p className="text-gray-600 text-sm">Average cash reconciliation time</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
              <p className="text-gray-600 text-sm">Secure SMS authentication</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <Smartphone className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">Mobile</div>
              <p className="text-gray-600 text-sm">First design for on-the-go</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">Free</div>
              <p className="text-gray-600 text-sm">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-orange-600 to-red-600">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to Simplify Your Restaurant Operations?
          </h2>
          <p className="text-base sm:text-lg text-orange-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            Join restaurant owners who are saving time and reducing errors with Restaurant Daily.
          </p>
          <Link
            href="/auth/phone"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-orange-600 font-semibold py-3 sm:py-4 px-6 sm:px-10 rounded-lg text-base sm:text-lg transition-colors duration-200 shadow-lg w-full sm:w-auto max-w-xs"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <p className="text-xs sm:text-sm text-orange-100 mt-3 sm:mt-4">
            No credit card required • Set up in 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="Restaurant Daily"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-white font-semibold text-lg">Restaurant Daily</span>
              </div>
              <p className="text-sm">
                Mobile-first restaurant management for modern Indian restaurants.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/phone" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://mindweave.tech" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About Mindweave</a></li>
                <li><a href="https://mindweave.tech/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2025 Mindweave Technologies Pvt. Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
