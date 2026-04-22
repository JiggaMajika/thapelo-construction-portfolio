import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heading: "20 Years of Transferable Experience",
    description: "Bringing operational excellence from high-volume logistics and massive stadium events to the built environment."
  },
  {
    image: "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heading: "Uncompromising Safety Standards",
    description: "Enhanced DBS cleared, formal HACCP safety trained, and highly comfortable executing strictly monitored safe-systems-of-work."
  },
  {
    image: "https://images.pexels.com/photos/816056/pexels-photo-816056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heading: "Ready for Immediate Deployment",
    description: "Fully supported by Luton's Connect to Work programme. Secure your highly reliable apprenticeship candidate today."
  }
];

export default function Profile() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds auto-play
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center bg-[#0D0D0D] overflow-hidden group border-b-8 border-theme">
        {/* Carousel Background Images */}
        {slides.map((slide, idx) => (
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
        
        {/* Carousel Text Content */}
        <div className="relative z-20 max-w-[1170px] mx-auto px-[15px] w-full mt-10">
          <div className="max-w-[850px] overflow-hidden">
             {/* Uses a key to force re-render so simple CSS animations can play, or relies on standard transition. */}
             <div key={currentSlide} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[16px] md:text-[18px] mb-4 flex items-center gap-3">
                  <span className="w-12 h-[3px] bg-theme inline-block"></span> Candidate Profile
                </h4>
                <h1 className="font-heading font-bold text-white text-[45px] lg:text-[60px] leading-[1.05] mb-6 uppercase">
                  {slides[currentSlide].heading}
                </h1>
                <p className="font-body text-white/90 text-[20px] md:text-[24px] leading-[1.6]">
                  {slides[currentSlide].description}
                </p>
             </div>
          </div>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <div className="absolute z-30 bottom-10 right-4 md:right-10 flex gap-4">
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

        {/* Carousel Pagination Dots */}
        <div className="absolute z-30 bottom-10 left-1/2 -translate-x-1/2 flex gap-3 flex-wrap">
           {slides.map((_, idx) => (
             <button
               key={idx}
               onClick={() => setCurrentSlide(idx)}
               className={`w-4 h-4 rounded-full transition-colors ${idx === currentSlide ? 'bg-theme w-10' : 'bg-white/40 hover:bg-white/70'}`}
               aria-label={`Go to slide ${idx + 1}`}
             />
           ))}
        </div>
      </section>
      
      {/* Profile Overview */}
      <section className="py-[80px] lg:py-[120px] bg-white">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex items-center gap-3">
                <span className="w-12 h-[3px] bg-theme inline-block"></span> Candidate Profile
              </h4>
              <h2 className="font-heading font-bold text-[40px] lg:text-[50px] text-title uppercase leading-[1.1] mb-8">
                Over 20 years of transferable experience.
              </h2>
              <div className="prose prose-lg max-w-none text-body font-body text-[20px] leading-relaxed">
                <p className="mb-6">
                  A dependable, safety-conscious Luton resident seeking a supported entry into the construction and built environment sector through an apprenticeship or paid work-experience pathway. 
                </p>
                <p className="mb-6">
                  Over 20 years of transferable experience across customer-facing, team-leadership, and regulated-environment roles, including hospitality supervision, stadium operations, and retail. Committed to absolute reliability, teamwork, and rigorous health-and-safety compliance.
                </p>
                <p>
                  Actively supported by Luton Council's Connect to Work programme and referred through Luton Borough Council's Directorate of Inclusive Growth.
                </p>
              </div>
            </div>
            
            <div className="bg-grey p-10 lg:p-14 border-t-8 border-theme rounded-br-[50px] shadow-lg flex flex-col justify-center">
              <h3 className="font-heading font-bold text-[35px] uppercase text-title mb-6 leading-[1.2]">Why Construction?</h3>
              <p className="font-body text-[20px] text-body leading-relaxed mb-10">
                Luton and the broader Bedfordshire region are currently defined by an incredible housing and infrastructure pipeline. Discover my full motivation for transitioning into the built environment and securing a structured pathway toward a trade qualification locally.
              </p>
              <div>
                <Link to="/why-construction" className="bg-theme text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-title transition-colors inline-block text-center">
                  Read My Motivation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Background Section */}
      <section className="py-[80px] lg:py-[120px] bg-[#141414] text-white">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="text-center mb-16">
            <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex justify-center items-center gap-3">
               <span className="w-12 h-[3px] bg-theme inline-block"></span> Transferable Value
            </h4>
            <h2 className="font-heading font-bold text-[40px] md:text-[50px] uppercase leading-[1.1] mb-8 text-theme">
              Professional Background
            </h2>
          </div>

          <div className="space-y-20">
            {/* Block 1: Industrial & Regulated Environments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="order-2 lg:order-1">
                 <h3 className="font-heading font-bold text-[30px] uppercase mb-6 text-white leading-[1.2]">Strict Regulated & Industrial Environments</h3>
                 <p className="font-body text-[20px] text-[#CECECE] leading-relaxed mb-8">
                   With direct experience functioning as a Fulfilment Centre Associate at Amazon and supervising matchday hospitality at massive venues like Tottenham Hotspur Stadium, I am highly accustomed to strict Standard Operating Procedures (SOPs).
                 </p>
                 <ul className="space-y-5 font-body text-[18px] text-white/90">
                   <li className="flex gap-4 items-start">
                     <span className="text-theme font-bold text-[20px] mt-[-2px]">✓</span> 
                     Consistently met strict daily productivity targets in PPE-aware spaces.
                   </li>
                   <li className="flex gap-4 items-start">
                     <span className="text-theme font-bold text-[20px] mt-[-2px]">✓</span> 
                     Executed comprehensive health, safety, and hygiene compliance protocols.
                   </li>
                   <li className="flex gap-4 items-start">
                     <span className="text-theme font-bold text-[20px] mt-[-2px]">✓</span> 
                     Thrived in fast-paced, high-volume operational systems under direct supervision.
                   </li>
                 </ul>
               </div>
               <div className="order-1 lg:order-2">
                 <img src="https://images.pexels.com/photos/1797428/pexels-photo-1797428.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2" alt="Industrial warehouse logistics environment, no people" className="w-full h-[350px] object-cover border-b-8 border-theme shadow-2xl" crossOrigin="anonymous" />
               </div>
            </div>

            {/* Block 2: Leadership & Coordination */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div>
                 <img src="https://images.pexels.com/photos/2827400/pexels-photo-2827400.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2" alt="Busy corporate catering and office environment" className="w-full h-[350px] object-cover border-b-8 border-theme shadow-2xl" crossOrigin="anonymous" />
               </div>
               <div>
                 <h3 className="font-heading font-bold text-[30px] uppercase mb-6 text-white leading-[1.2]">Team Coordination & Site Logistics</h3>
                 <p className="font-body text-[20px] text-[#CECECE] leading-relaxed mb-8">
                   Supervising operations for major corporate accounts (CAPITA) and coaching youth football (UEFA C Diploma) demanded immense adaptability and real-time logistical problem-solving.
                 </p>
                 <ul className="space-y-5 font-body text-[18px] text-white/90">
                   <li className="flex gap-4 items-start">
                     <span className="text-theme font-bold text-[20px] mt-[-2px]">✓</span> 
                     Managed back-of-house activities, complex stock rotation, and reliable site preparation.
                   </li>
                   <li className="flex gap-4 items-start">
                     <span className="text-theme font-bold text-[20px] mt-[-2px]">✓</span> 
                     Communicated clearly under pressure in cross-cultural, massive-scale team structures.
                   </li>
                   <li className="flex gap-4 items-start">
                     <span className="text-theme font-bold text-[20px] mt-[-2px]">✓</span> 
                     Delivered structured, safe operations outdoors regardless of challenging weather conditions.
                   </li>
                 </ul>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip to Motivation */}
      <section className="bg-theme py-[80px] lg:py-[120px]">
        <div className="max-w-[1170px] mx-auto px-[15px] flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <h2 className="font-heading font-bold text-[40px] text-white uppercase m-0 leading-[1.2] max-w-[800px]">
            Discover my motivation to build Bedfordshire's future.
          </h2>
          <Link to="/why-construction" className="bg-white text-title font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-title hover:text-white transition-colors shrink-0 shadow-xl">
            Why Construction?
          </Link>
        </div>

        <div className="max-w-[1170px] mx-auto px-[15px] flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="font-heading font-bold text-[40px] text-title border-l-4 border-white pl-6 uppercase m-0 leading-[1.2] max-w-[800px]">
            Or explore my full 20-year work history and operational background.
          </h2>
          <Link to="/experience" className="bg-[#141414] text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-white hover:text-title transition-colors shrink-0 shadow-xl">
            View Experience
          </Link>
        </div>
      </section>
    </div>
  );
}
