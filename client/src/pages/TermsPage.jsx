import React from 'react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import { FaArrowRightLong } from "react-icons/fa6";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <WhiteNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-[url('/img/tm.png')] bg-cover bg-center bg-no-repeat text-white overflow-hidden">
        <div className="absolute inset-0 bg-[#00564C]/80"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
            Terms of Service
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-95 mb-8">
            The legal agreement between you and AfroTask. Governing your use of our freelancer platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <span className="text-sm opacity-90">Last Updated: March 1, 2026</span>
          </div>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">On this page</h2>
            <nav className="space-y-3">
              <a href="#acceptance" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">1. Acceptance</a>
              <a href="#accounts" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">2. Accounts</a>
              <a href="#services" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">3. Services</a>
              <a href="#payments" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">4. Payments & Fees</a>
              <a href="#freelancer-obligations" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">5. Freelancer Obligations</a>
              <a href="#client-obligations" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">6. Client Obligations</a>
              <a href="#projects" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">7. Projects & Disputes</a>
              <a href="#ip-rights" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">8. IP Rights</a>
              <a href="#termination" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">9. Termination</a>
              <a href="#liability" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">10. Liability</a>
              <a href="#governing" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">11. Governing Law</a>
              <a href="#contact" className="block py-2 px-3 rounded-lg text-gray-700 hover:text-[#00564C] hover:bg-green-50 font-medium transition">12. Contact</a>
            </nav>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-3 max-w-none lg:border-l border-gray-200 lg:pl-12">
            
            <section id="acceptance" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">1. Acceptance of Terms</h2>
              <p>
                These Terms of Service ("Terms") govern your access to and use of AfroTask ("Platform," "we," "us"). 
                By registering or using the Platform, you agree to these Terms and our <a href="/policy">Privacy Policy</a>.
              </p>
            </section>

            <section id="accounts" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">2. Accounts & Eligibility</h2>
              <dl className="ml-12">
                <li>You must be 18+ and legally able to work</li>
                <li>Provide accurate information; keep account secure</li>
                <li>Choose role: Freelancer or Client (one primary)</li>
                <li>Prohibited: Multiple accounts, fake info, spam</li>
              </dl>
            </section>

            <section id="services" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">3. Services</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
                  <h3 className="text-xl font-bold text-[#00564C] mb-4">For Freelancers</h3>
                  <p>Browse jobs, submit proposals, showcase portfolio, manage projects.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
                  <h3 className="text-xl font-bold text-[#00564C] mb-4">For Clients</h3>
                  <p>Post jobs, review proposals, hire freelancers, manage payments.</p>
                </div>
              </div>
              <p>We provide matching tools but make no hiring guarantees.</p>
            </section>

            <section id="payments" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">4. Payments & Fees</h2>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl border-l-8 border-amber-500 mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Platform Fee: 10% of project value</h3>
                <dl className="space-y-2">
                  <li>Milestone payments held in escrow</li>
                  <li>Released only on client approval</li>
                  <li>Disputes: Mediation fee applies</li>
                </dl>
              </div>
              <p>All payments via secure processors. No refunds except as specified.</p>
            </section>

            <section id="freelancer-obligations" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">5. Freelancer Obligations</h2>
              <dl className="ml-12">
                <li>Deliver work on time, to specifications</li>
                <li>Communicate professionally</li>
                <li>Protect client confidential info</li>
                <li>No plagiarism or low-quality work</li>
                <li>Handle taxes/VAT as independent contractor</li>
              </dl>
            </section>

            <section id="client-obligations" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">6. Client Obligations</h2>
              <dl className="ml-12">
                <li>Provide clear requirements/timelines</li>
                <li>Review & approve work promptly</li>
                <li>Pay on time via milestones</li>
                <li>Provide constructive feedback</li>
              </dl>
            </section>

            <section id="projects" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">7. Projects & Dispute Resolution</h2>
              <p>Projects managed via workspace. Disputes: 7-day mediation. Unresolved → escrow refund proportional to completion.</p>
            </section>

            <section id="ip-rights" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">8. Intellectual Property Rights</h2>
              <dl className="ml-12">
                <li>Client owns final deliverables upon payment</li>
                <li>Freelancer retains portfolio rights (anonymized)</li>
                <li>Pre-existing IP disclosed upfront</li>
                <li>Platform owns user-generated content license (non-exclusive)</li>
              </dl>
            </section>

            <section id="termination" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">9. Termination</h2>
              <dl className="ml-12">
                <li>Account suspension for violations</li>
                <li>30-day notice for termination</li>
                <li>Open projects completed or refunded</li>
              </dl>
            </section>

            <section id="liability" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">10. Limitation of Liability</h2>
              <p>Platform "as is." No liability for freelancer/client disputes beyond mediation. Max liability = 3 months fees paid.</p>
            </section>

            <section id="governing" className="mb-12">
              <h2 className="lg:text-3xl text-xl font-bold">11. Governing Law</h2>
              <p>Laws of Nigeria govern. Disputes in Lagos courts. International users consent to jurisdiction.</p>
            </section>

            <section id="contact">
              <h2 className="lg:text-3xl text-xl font-bold">12. Contact Us</h2>
              <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-200 max-w-2xl mx-auto text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Need clarification?</h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Our team responds within 24 hours.
                </p>
                <div className="space-y-4 text-lg">
                  <a href="mailto:support@afrotask.com" className="block bg-gradient-to-r from-[#00564C] to-[#008B7D] text-white py-4 px-8 rounded-2xl hover:from-[#004438] hover:to-[#00665A] transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    support@afrotask.com
                  </a>
                  <a href="/contact" className="block border-2 border-gray-200 py-4 px-8 rounded-2xl hover:border-[#00564C] hover:text-[#00564C] hover:bg-green-50 transition-all duration-300 font-semibold">
                    Contact Form →
                  </a>
                </div>
              </div>
              <div className="text-center mt-16 p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-sm text-gray-600">
                  See our <a href="/policy" className="text-[#00564C] hover:underline font-medium">Privacy Policy</a> for data protection.
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
