import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Video, MessageCircle, ShieldCheck, Layers, Zap,
  UserCheck, Briefcase, ArrowRight, Star
} from 'lucide-react';
import WhiteNavbar from '../components/navbar/WhiteNavbar';
import Footer from '../components/Footer';

// Reusable fade-in-on-scroll wrapper
function FadeIn({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Video, title: 'Video-Based Identity', desc: 'Freelancers introduce themselves through video, giving clients a real sense of who they are before hiring.' },
  { icon: MessageCircle, title: 'Real-Time Communication', desc: 'Built-in messaging keeps clients and freelancers connected throughout every project.' },
  { icon: ShieldCheck, title: 'Transparent Hiring', desc: 'Every step of the hiring process is visible — no hidden fees, no surprises.' },
  { icon: Layers, title: 'Project-Based Discovery', desc: 'Browse real projects and find talent matched to your exact needs.' },
  { icon: Zap, title: 'Smart Matching System', desc: 'Our ranking engine surfaces the best freelancers based on skills, ratings, and performance.' },
];

const steps = [
  { num: '01', icon: UserCheck, title: 'Sign Up', desc: 'Create your account as a freelancer or client in minutes.' },
  { num: '02', icon: Briefcase, title: 'Build Your Profile', desc: 'Showcase your skills, portfolio, and intro video to stand out.' },
  { num: '03', icon: Layers, title: 'Discover or Post Jobs', desc: 'Clients post projects; freelancers browse and apply instantly.' },
  { num: '04', icon: MessageCircle, title: 'Connect & Work', desc: 'Chat, agree on terms, and deliver great work together.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <WhiteNavbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#00564C] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FB9E01 0%, transparent 60%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-[#FB9E01] font-semibold tracking-widest uppercase text-sm mb-4"
            >
              About AfroTask
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Connecting Talent<br />
              <span className="text-[#FB9E01]">With Opportunity</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/80 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-8"
            >
              AfroTask is Africa's freelance marketplace built to bridge the gap between skilled professionals and the clients who need them most.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <button onClick={() => navigate('/welcome')}
                className="bg-[#FB9E01] hover:bg-[#CC8102] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/explore-projects')}
                className="border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:bg-white/10">
                Explore Projects
              </button>
            </motion.div>
          </div>

          {/* Hero images — 2×2 grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img src="/img/Ld1.png" alt="AfroTask freelancer" className="w-full h-40 md:h-52 object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="rounded-2xl overflow-hidden shadow-2xl mt-6"
            >
              <img src="/img/whisk.png" alt="AfroTask work" className="w-full h-40 md:h-52 object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-2xl -mt-6"
            >
              <img src="/img/fa1.png" alt="AfroTask talent" className="w-full h-40 md:h-52 object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img src="/img/cn.png" alt="AfroTask board" className="w-full h-40 md:h-52 object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <FadeIn direction="right" className="flex-1">
            <img src="/img/mr_tope.png" alt="Who we are" className="w-full rounded-3xl shadow-xl object-cover max-h-[480px]" />
          </FadeIn>
          <FadeIn direction="left" delay={0.15} className="flex-1">
            <p className="text-[#00564C] font-semibold tracking-widest uppercase text-sm mb-3">Who We Are</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Built for Africa,<br />by Africans
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-5">
              AfroTask was born from a simple observation: Africa is full of world-class talent, but the tools to connect that talent with real opportunities were built for someone else.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-5">
              We built AfroTask to change that. A platform where freelancers can showcase their real skills, clients can find the right person fast, and both sides can work together with full transparency.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you're a developer in Lagos, a designer in Nairobi, or a startup founder in Accra — AfroTask is your home.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── What Makes Us Different ── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-[#00564C] font-semibold tracking-widest uppercase text-sm mb-3">Our Edge</p>
            <h2 className="text-3xl md:text-4xl font-bold">What Makes Us Different</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 bg-[#00564C]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#00564C] transition-colors duration-300">
                    <f.icon className="w-6 h-6 text-[#00564C] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-[#00564C] font-semibold tracking-widest uppercase text-sm mb-3">Purpose</p>
            <h2 className="text-3xl md:text-4xl font-bold">Mission & Vision</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn direction="right">
              <div className="relative rounded-3xl overflow-hidden p-10 h-full"
                style={{ background: 'linear-gradient(135deg, #00564C 0%, #027568 100%)' }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
                <Star className="w-10 h-10 text-[#FB9E01] mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  To help people find opportunities and grow through real work — by building a platform where talent is recognized, rewarded, and connected to those who need it most.
                </p>
              </div>
            </FadeIn>
            <FadeIn direction="left" delay={0.15}>
              <div className="relative rounded-3xl overflow-hidden p-10 h-full"
                style={{ background: 'linear-gradient(135deg, #FB9E01 0%, #CC8102 100%)' }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
                <Zap className="w-10 h-10 text-white mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  To build the most transparent freelance marketplace in the world — starting from Africa, and growing into a global standard for how work gets done.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-[#00564C] font-semibold tracking-widest uppercase text-sm mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#00564C] to-[#FB9E01] z-0" />
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.1} className="relative z-10">
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#00564C] flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[#FB9E01] font-black text-sm tracking-widest">{s.num}</span>
                  <h3 className="text-lg font-bold mt-1 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-[#00564C] font-semibold tracking-widest uppercase text-sm mb-3">The Team</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-14">The People Behind AfroTask</h2>
          </FadeIn>

          {/* Founder — centered, larger */}
          <FadeIn delay={0.1} className="flex justify-center mb-10">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 flex flex-col items-center w-full max-w-sm hover:shadow-2xl transition-shadow duration-300">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#00564C] to-[#027568] flex items-center justify-center mb-6 shadow-lg">
                <img src="/img/mr_tope.png" alt="Founder" className="h-full w-full rounded-full" />
              </div>
              <h3 className="text-xl font-bold mb-1">Tope Adeosun</h3>
              <p className="text-[#FB9E01] font-semibold text-sm mb-4">Founder of AfroTask</p>
              <p className="text-gray-500 text-sm leading-relaxed text-center">
                Visionary behind AfroTask — driven by a mission to unlock Africa's talent potential and create a transparent, opportunity-rich freelance ecosystem across the continent.
              </p>
            </div>
          </FadeIn>

          {/* Dev team — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <FadeIn delay={0.15}>
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00564C] to-[#027568] flex items-center justify-center mb-5 shadow-md">
                  <img src="/img/mba.png" alt="dev" className="h-full w-full rounded-full" />
                </div>
                <h3 className="text-lg font-bold mb-1">Mbata Blessing</h3>
                <p className="text-[#00564C] font-medium text-sm mb-3">Lead Developer</p>
                <p className="text-gray-500 text-sm leading-relaxed text-center">
                  Responsible for building the full AfroTask application — from architecture to deployment.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FB9E01] to-[#CC8102] flex items-center justify-center mb-5 shadow-md">
                  <img src="/img/vo.png" alt="dev" className="h-full w-full rounded-full" />
                </div>
                <h3 className="text-lg font-bold mb-1">Victor Olumide</h3>
                <p className="text-[#FB9E01] font-medium text-sm mb-3">Frontend Developer</p>
                <p className="text-gray-500 text-sm leading-relaxed text-center">
                  Crafting the user-facing experience — ensuring AfroTask looks and feels world-class on every device.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-24"
        style={{ background: 'linear-gradient(135deg, #00564C 0%, #027568 60%, #00564C 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, #FB9E01 0%, transparent 50%), radial-gradient(circle at 90% 10%, #fff 0%, transparent 50%)' }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start your journey with<br />
              <span className="text-[#FB9E01]">AfroTask today</span>
            </h2>
            <p className="text-white/70 text-lg mb-10">
              Join thousands of freelancers and clients already building the future of work in Africa.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => navigate('/welcome')}
                className="bg-[#FB9E01] hover:bg-[#CC8102] text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 text-lg flex items-center gap-2">
                Sign Up Free <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/explore-projects')}
                className="border-2 border-white/40 hover:border-white text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:bg-white/10 text-lg">
                Explore Projects
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
