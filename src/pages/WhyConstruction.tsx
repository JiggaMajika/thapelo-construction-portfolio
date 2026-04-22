import PageBanner from '../components/PageBanner';
import { TrendingUp, MapPin, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhyConstruction() {
  return (
    <div>
      <PageBanner title="Why Construction?" breadcrumb="Motivation" />
      
      {/* Section 1: Luton Growth */}
      <section className="py-[80px] lg:py-[120px] bg-white">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex items-center gap-3">
                <span className="w-12 h-[3px] bg-theme inline-block"></span> Local Motivation
              </h4>
              <h2 className="font-heading font-bold text-[40px] md:text-[50px] text-title uppercase leading-[1.1] mb-8">
                Building Bedfordshire's Future
              </h2>
              <p className="font-body text-[20px] leading-relaxed text-body mb-6">
                Luton's housing and infrastructure pipeline provides one of the most visible growth stories in the region. From major new residential developments to the massive town-centre transformation encompassing the new Power Court stadium, the skyline is evolving rapidly.
              </p>
              <p className="font-body text-[20px] leading-relaxed text-body mb-8">
                I want to be a direct part of that local legacy. The built environment is physically reshaping where we live, and contributing functionally to that structural progression across Luton and the broader Bedfordshire area is highly motivating.
              </p>
              <div className="flex items-center gap-5 bg-grey p-6 border-l-4 border-theme shadow-sm">
                 <MapPin className="w-10 h-10 text-theme shrink-0" />
                 <span className="font-heading font-bold text-[20px] text-title uppercase tracking-wide">Rooted In Luton, Bedfordshire</span>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Construction and urban development, no people" 
                className="w-full h-[550px] object-cover shadow-xl border-b-8 border-theme" 
                crossOrigin="anonymous" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Long-term Career & Progression */}
      <section className="py-[80px] lg:py-[120px] bg-[#141414] text-white">
        <div className="max-w-[1170px] mx-auto px-[15px] text-center">
          <div className="max-w-[900px] mx-auto">
            <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex justify-center items-center gap-3">
              <span className="w-12 h-[3px] bg-theme inline-block"></span> Career Trajectory
            </h4>
            <h2 className="font-heading font-bold text-[40px] md:text-[50px] uppercase leading-[1.1] mb-12">
              A Structured Pathway to Sustainable Employment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left mt-8">
               <div className="bg-white/5 border border-white/10 p-10 hover:border-theme transition-colors">
                  <TrendingUp className="w-12 h-12 text-theme mb-6" />
                  <h3 className="font-heading font-bold text-[26px] uppercase mb-4 text-white">Genuine Progression</h3>
                  <p className="font-body text-[18px] text-[#CECECE] leading-relaxed">
                    Construction offers a clear, long-term career with genuine earning progression based on skill and reliability. After two decades of varied, team-oriented work, I am highly focused on securing a strictly defined trade pathway.
                  </p>
               </div>
               <div className="bg-white/5 border border-white/10 p-10 hover:border-theme transition-colors">
                  <Landmark className="w-12 h-12 text-theme mb-6" />
                  <h3 className="font-heading font-bold text-[26px] uppercase mb-4 text-white">Trade Qualification</h3>
                  <p className="font-body text-[18px] text-[#CECECE] leading-relaxed">
                    My ultimate goal is to leverage an apprenticeship to achieve a recognised trade qualification. I am fiercely committed to doing the groundwork necessary to transition into full-time, sustainable employment in the built environment.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Supported by Network */}
      <section className="py-[80px] lg:py-[120px] bg-theme text-white border-b-8 border-title">
        <div className="max-w-[1170px] mx-auto px-[15px]">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
               <h2 className="font-heading font-bold text-[45px] md:text-[55px] leading-[1.1] uppercase mb-8">
                 Fully Supported <br/>& Ready To Deploy
               </h2>
               <p className="font-body text-[22px] text-white/95 leading-relaxed mb-10">
                 I am a Universal Credit claimant and am proactively utilizing regional support networks to successfully re-enter the workforce through an apprenticeship in this high-growth sector.
               </p>
               <Link to="/contact" className="bg-title text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-white hover:text-title transition-colors inline-block shadow-lg">
                 Get In Touch Today
               </Link>
             </div>
              <div className="bg-white p-12 shadow-2xl">
                <h3 className="font-heading font-bold text-[30px] uppercase text-title mb-8 border-b-2 border-grey pb-5">
                  Professional Support Network
                </h3>
                <ul className="space-y-8">
                  <li className="flex items-start gap-5">
                    <div className="w-4 h-4 bg-theme shrink-0 mt-2"></div>
                    <div className="font-body text-body text-[18px] leading-relaxed">
                      <strong className="text-title text-[22px] block mb-1">Midhun Kumar</strong>
                      Project Officer for Apprenticeships, Luton Borough Council. (Vocational Referral)
                    </div>
                  </li>
                  <li className="flex items-start gap-5">
                    <div className="w-4 h-4 bg-title shrink-0 mt-2"></div>
                    <div className="font-body text-body text-[18px] leading-relaxed">
                      <strong className="text-title text-[22px] block mb-1">Zain Ahmed</strong>
                      Employment Specialist, Connect to Work (Luton Council).
                    </div>
                  </li>
                </ul>
             </div>
           </div>
        </div>
      </section>

    </div>
  );
}
