import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const homeSlides = [
  {
    image: "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heading: "Ready to Build Bedfordshire’s Future",
    subheading: "...with Reliability, Safety, and Proven Teamwork."
  },
  {
    image: "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heading: "Seeking an Apprenticeship Pathway",
    subheading: "Committed to securing a long-term, structurally supported role in the built environment."
  },
  {
    image: "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heading: "Fully Supported & Vetted",
    subheading: "Connected via Luton's Inclusive Growth and fully prepared to deploy immediately."
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeSlides.length);
    }, 6000); // 6 seconds auto-play
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % homeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + homeSlides.length) % homeSlides.length);

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center bg-[#0D0D0D] overflow-hidden group">
        {/* Carousel Background Images */}
        {homeSlides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-black/70 z-10" />
            <img 
              src={slide.image} 
              alt={slide.heading}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
        ))}
        
        <div className="relative z-20 max-w-[1170px] mx-auto px-[15px] w-full mt-10">
          <div className="max-w-[900px]">
             <div key={currentSlide} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="font-heading font-bold text-white text-[50px] lg:text-[70px] leading-[1.05] mb-4 uppercase">
                  {homeSlides[currentSlide].heading}
                </h1>
                <h2 className="font-heading font-bold text-theme text-[30px] lg:text-[40px] leading-[1.1] mb-8 uppercase">
                  {homeSlides[currentSlide].subheading}
                </h2>
                <p className="font-body text-white/95 text-[20px] md:text-[24px] leading-[1.6] mb-12 max-w-[800px]">
                  Experienced, safety-conscious, and ready to contribute. Bringing over 20 years of transferable expertise to a secure, long-term career in construction—equipped with a primary focus on the transformative developments across Luton and the Power Court site.
                </p>
                <div className="flex flex-wrap gap-5">
                  <Link to="/profile" className="bg-theme text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-white hover:text-theme transition-colors flex items-center justify-center gap-3">
                    Discover More <ArrowRight size={22} />
                  </Link>
                  <Link to="/contact" className="bg-white text-title font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-theme hover:text-white transition-colors">
                    Contact Me
                  </Link>
                </div>
             </div>
          </div>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <div className="absolute z-30 bottom-10 right-4 md:right-10 flex gap-4 hidden md:flex">
           <button 
             onClick={prevSlide} 
             className="w-14 h-14 bg-white/10 hover:bg-theme text-white border border-white/20 flex items-center justify-center transition-colors"
             aria-label="Previous Slide"
           >
             <ChevronLeft size={28} />
           </button>
           <button 
             onClick={nextSlide} 
             className="w-14 h-14 bg-white/10 hover:bg-theme text-white border border-white/20 flex items-center justify-center transition-colors"
             aria-label="Next Slide"
           >
             <ChevronRight size={28} />
           </button>
        </div>
      </section>

      {/* Stats Counter Section - Overlapping style */}
      <section className="relative z-30 mt-[-50px] max-w-[1170px] mx-auto px-[15px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-custom border-b-4 border-theme"
        >
          <div className="p-10 text-center md:text-left flex items-start gap-6 group hover:bg-slate-50 transition-colors">
            <div className="font-heading font-bold text-[65px] text-theme leading-none group-hover:scale-105 transition-transform">20+</div>
            <div>
              <div className="font-heading uppercase font-bold text-[20px] text-title mb-2">Years Experience</div>
              <p className="font-body text-body text-[16px] m-0 leading-relaxed">Customer-facing, team-leadership, and regulated environments.</p>
            </div>
          </div>
          <div className="p-10 text-center md:text-left flex items-start gap-6 group hover:bg-slate-50 transition-colors">
            <div className="font-heading font-bold text-[65px] text-theme leading-none group-hover:scale-105 transition-transform">3+</div>
            <div>
              <div className="font-heading uppercase font-bold text-[20px] text-title mb-2">Safety Certs</div>
              <p className="font-body text-body text-[16px] m-0 leading-relaxed">HACCP, Health & Safety, Food Safety, First Aid & Safeguarding.</p>
            </div>
          </div>
          <div className="p-10 text-center md:text-left flex items-start gap-6 group hover:bg-slate-50 transition-colors">
            <div className="font-heading font-bold text-[65px] text-theme leading-none group-hover:scale-105 transition-transform">100%</div>
            <div>
              <div className="font-heading uppercase font-bold text-[20px] text-title mb-2">Reliable</div>
              <p className="font-body text-body text-[16px] m-0 leading-relaxed">Track record of strict attendance across stadium events and retail.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature / About Snippet Section */}
      <section className="py-[80px] lg:py-[120px] bg-grey">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex items-center gap-3">
                <span className="w-12 h-[3px] bg-theme inline-block"></span> Career Objective
              </h4>
              <h2 className="font-heading font-bold text-[45px] lg:text-[55px] text-title uppercase leading-[1.1] mb-8">
                A dependable entry into the built environment.
              </h2>
              <p className="font-body text-[20px] leading-relaxed text-body mb-8">
                I am a dependable, safety-conscious professional based in Luton, seeking a supported entry into the regional construction sector through an apprenticeship or paid work-experience pathway. While I am highly motivated by local initiatives like the Power Court build, I am equally ready to deploy my skills on sites across the broader county.
              </p>
              
              <ul className="space-y-5 mb-12">
                <li className="flex items-start gap-4 font-heading font-bold text-[18px] text-title uppercase">
                  <CheckCircle2 className="text-theme shrink-0 w-6 h-6 mt-0.5" /> Full clean UK driving licence.
                </li>
                <li className="flex items-start gap-4 font-heading font-bold text-[18px] text-title uppercase">
                  <CheckCircle2 className="text-theme shrink-0 w-6 h-6 mt-0.5" /> Enhanced DBS clearance.
                </li>
                <li className="flex items-start gap-4 font-heading font-bold text-[18px] text-title uppercase">
                  <CheckCircle2 className="text-theme shrink-0 w-6 h-6 mt-0.5" /> Supported by Luton Council's Connect to Work.
                </li>
              </ul>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/profile" className="bg-title text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-theme transition-colors inline-block">
                  Read Full Profile
                </Link>
                <Link to="/why-construction" className="bg-theme text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-title transition-colors inline-flex items-center gap-2">
                  My Motivation <ArrowRight size={22} />
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img 
                src="https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Realistic construction site, architecture, daylight."
                className="w-full h-[600px] object-cover shadow-2xl border-b-8 border-theme"
                crossOrigin="anonymous"
              />
              <div className="absolute -bottom-10 -left-10 bg-theme p-10 hidden md:block shadow-xl">
                <div className="text-white font-heading font-bold uppercase tracking-widest text-[16px] mb-2">Available Now</div>
                <div className="text-white font-heading font-bold text-[35px] leading-none">For Apprenticeship</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Strip */}
      <section className="py-[80px] lg:py-[120px] bg-theme">
        <div className="max-w-[1170px] mx-auto px-[15px] flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="font-heading font-bold text-[40px] text-white uppercase m-0 leading-[1.2] max-w-[800px]">
            Ready to bring 20+ years of reliability to your team?
          </h2>
          <Link to="/contact" className="bg-title text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-white hover:text-title transition-colors shrink-0">
            Get In Touch
          </Link>
        </div>
      </section>
    </div>
  );
}

