import React from 'react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import { FaArrowRightLong } from "react-icons/fa6";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <WhiteNavbar />
      
      {/* Hero Section - Fixed blend and overlay */}
      <section className="relative p-10 bg-[url('/img/sk.png')] bg-cover bg-center bg-no-repeat text-white overflow-hidden">
        <div className="absolute inset-0 bg-[#00564C]/80"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
            Privacy Policy
          </h1>
          <p className="text-green-100 text-lg max-w-2xl  mx-auto leading-relaxed mb-2 drop-shadow-lg">
            Your trust is our priority. We protect your data with enterprise-grade security while connecting African talent to global opportunities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center max-w-md mx-auto">
            <span className="text-sm opacity-90 drop-shadow-md">Last Updated: March 1, 2026</span>
          </div>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">On this page</h2>
            <nav className="space-y-3">
              <a href="#introduction" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">1. Introduction</a>
              <a href="#data-collection" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">2. Data We Collect</a>
              <a href="#data-use" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">3. How We Use Data</a>
              <a href="#sharing" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">4. Data Sharing</a>
              <a href="#security" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">5. Security</a>
              <a href="#freelancer-specific" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">6. Freelancer Data</a>
              <a href="#cookies" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">7. Cookies</a>
              <a href="#rights" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">8. Your Rights</a>
              <a href="#changes" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">9. Changes</a>
              <a href="#contact" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">10. Contact</a>
            </nav>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-3 max-w-none lg:border-l border-gray-200 lg:pl-12">
            
            <section id="introduction" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">1. Introduction</h2>
              <p>
                Welcome to AfroTask's Privacy Policy. At AfroTask, we connect talented African freelancers with clients worldwide. 
                Your privacy matters. This policy explains how we collect, use, share, and protect your information.
              </p>
              <p>
                By using AfroTask, you agree to this policy. We comply with applicable data protection laws including GDPR for EU users.
              </p>
            </section>

            <section id="data-collection" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">2. Data We Collect</h2>
              <dl className="ml-12">
                <li><strong>Account Information:</strong> Name, email, phone, password, role (freelancer/client)</li>
                <li><strong>Profile Data:</strong> Bio, skills, portfolio, location, payment details</li>
                <li><strong>Job/Project Data:</strong> Proposals, contracts, milestones, reviews</li>
                <li><strong>Communication:</strong> Messages, notifications, support tickets</li>
                <li><strong>Usage Data:</strong> IP address, browser type, pages visited</li>
                <li><strong>Files:</strong> Portfolio images, project deliverables (processed via Cloudinary)</li>
              </dl>
            </section>

            <section id="data-use" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">3. How We Use Your Data</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
                  <h3 className="text-xl font-bold text-[#00564C] mb-4">Matchmaking</h3>
                  <p>We use your skills and preferences to recommend relevant jobs and freelancers.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
                  <h3 className="text-xl font-bold text-[#00564C] mb-4">Payments</h3>
                  <p>Process transactions securely and prevent fraud.</p>
                </div>
              </div>
              <dl className="ml-12">
                <li>Provide and improve our services</li>
                <li>Send notifications and updates</li>
                <li>Analyze usage for better features</li>
                <li>Legal compliance and dispute resolution</li>
              </dl>
            </section>

            <section id="sharing" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">4. Data Sharing</h2>
              <p>We never sell your data. We share only when necessary:</p>
              <dl className="ml-12">
                <li><strong>With freelancers/clients:</strong> Profile info during job matching</li>
                <li><strong>Service providers:</strong> Firebase, Cloudinary, payment processors</li>
                <li><strong>Legal:</strong> Court orders, regulators</li>
                <li><strong>Business transfers:</strong> Mergers/acquisitions</li>
              </dl>
            </section>

            <section id="security" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">5. Security</h2>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-3xl border-l-8 border-[#00564C] mb-8">
                <h3 className="text-2xl font-bold text-[#00564C] mb-4">Enterprise-Grade Protection</h3>
                <dl className="space-y-2 text-lg">
                  <li> Firebase Authentication & Firestore encryption</li>
                  <li> End-to-end encryption for messages</li>
                  <li> 2FA on accounts</li>
                  <li> Regular security audits</li>
                  <li> GDPR/CCPA compliant</li>
                </dl>
              </div>
              <p>We use industry-leading security, but no system is 100% secure. Report issues to security@afrotask.com.</p>
            </section>

            <section id="freelancer-specific" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">6. Freelancer-Specific Protections</h2>
              <dl className="ml-12">
                <li>Portfolio images encrypted and access-controlled</li>
                <li>Payment details never shared with clients directly</li>
                <li>Dispute resolution data protected during mediation</li>
                <li>Review anonymity option available</li>
              </dl>
            </section>

            <section id="cookies" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">7. Cookies & Tracking</h2>
              <p>We use essential cookies for functionality. Analytics cookies help improve service (opt-out available).</p>
              <dl className="ml-12">
                <li>Session cookies (expire on logout)</li>
                <li>Preference cookies (dark mode, etc.)</li>
                <li>Analytics (anonymized)</li>
              </dl>
            </section>

            <section id="rights" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">8. Your Rights</h2>
              <dl className="ml-12">
                <li><strong>Access:</strong> Download your data anytime</li>
                <li><strong>Delete:</strong> Request account deletion (30-day hold)</li>
                <li><strong>Correct:</strong> Update inaccurate info</li>
                <li><strong>Opt-out:</strong> Marketing emails, cookies</li>
                <li>Email privacy@afrotask.com to exercise rights</li>
              </dl>
            </section>

            <section id="changes" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">9. Changes to This Policy</h2>
              <p>We may update this policy. Significant changes posted 30 days in advance with email notification. Continued use = acceptance.</p>
            </section>

            <section id="contact">
              <h2 className="lg:text-3xl text-xl font-bold">10. Contact Us</h2>
              <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-200 max-w-2xl text-center md:mx-auto">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Questions? We're here to help</h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Reach our Data Protection Officer anytime.
                </p>
                <div className="space-y-4 text-lg">
                  <a href="mailto:privacy@afrotask.com" className="block bg-gradient-to-r from-[#00564C] to-[#008B7D] text-white py-4 px-8 rounded-2xl hover:from-[#004438] hover:to-[#00665A] transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    privacy@afrotask.com
                  </a>
                  <a href="/contact" className="block border-2 border-gray-200 py-4 px-8 rounded-2xl hover:border-[#00564C] hover:text-[#00564C] hover:bg-green-50 transition-all duration-300 font-semibold flex flex-row items-center justify-center gap-2">
                    Contact us <FaArrowRightLong />
                  </a>
                </div>
              </div>
              <div className="text-center mt-16 p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-sm text-gray-600">
                  See also our <a href="/terms" className="text-[#00564C] hover:underline font-medium">Terms of Service</a>
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

