import React from 'react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';
import TopFreelancers from '../components/TopFreelancers';

export default function FreelancersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <WhiteNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
          <div>
            <TopFreelancers limit={50} />
          </div>
      </main>

      <Footer />
    </div>
  );
}
