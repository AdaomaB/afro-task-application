const Footer = () => {
  return (
    <footer className="bg-[#0F1419] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
                <img src="/img/afro-task.png" alt="Afro Task" className="h-12 w-auto" />
              <span className="text-2xl font-bold">Afro Task</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Find Freelancers</a></li>
              <li><a href="#" className="hover:text-white transition">Post a Job</a></li>
              <li><a href="#" className="hover:text-white transition">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Freelancers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Offer Services</a></li>
              <li><a href="#" className="hover:text-white transition">Find Work</a></li>
              <li><a href="#" className="hover:text-white transition">Freelancer Tips</a></li>
              <li><a href="#" className="hover:text-white transition">Community</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Trust & Safety</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-gray-400">
          <p>Afro Task 2025</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
