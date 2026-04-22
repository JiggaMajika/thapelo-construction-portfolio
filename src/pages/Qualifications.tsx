import PageBanner from '../components/PageBanner';
import { ShieldCheck, Award, MonitorDot, GraduationCap } from 'lucide-react';

export default function Qualifications() {
  return (
    <div className="bg-[#F7F7F7]">
      <PageBanner title="Qualifications" breadcrumb="Qualifications" />
      
      <section className="py-[80px] lg:py-[120px]">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="text-center mb-16">
            <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex justify-center items-center gap-3">
              <span className="w-12 h-[3px] bg-theme inline-block"></span> Verified & Certified
            </h4>
            <h2 className="font-heading font-bold text-[40px] md:text-[50px] text-title uppercase leading-[1.1]">
              Professional & Academic Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Category 1: Health, Safety & Compliance */}
            <div className="bg-white p-10 lg:p-12 shadow-sm border-t-8 border-theme hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-custom relative z-10">
                <ShieldCheck className="w-12 h-12 text-theme" />
                <h3 className="font-heading font-bold text-[28px] uppercase text-title m-0">Safety & Compliance</h3>
              </div>
              <ul className="space-y-6 font-body text-[18px] text-body leading-relaxed relative z-10">
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-theme mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Enhanced DBS Clearance</strong>
                    Maintained continuously throughout teaching, coaching, and supervision roles.
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-theme mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Level 2 HACCP, Health & Safety, Food Safety</strong>
                    Certified by British Institute of Innkeeping Awarding Body (BIIA), 2017.
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-theme mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">First Aid & Safeguarding</strong>
                    FA Emergency First Aid Certificate and FA Safeguarding Children Certificate (2017).
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-theme mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Security Industry Authority (SIA)</strong>
                    Held via G4S, authorised by the Home Office (2017, historical/renewable).
                  </div>
                </li>
              </ul>
              <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <ShieldCheck className="w-[300px] h-[300px]" />
              </div>
            </div>

            {/* Category 2: Sports & Leadership */}
            <div className="bg-white p-10 lg:p-12 shadow-sm border-t-8 border-title hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-custom relative z-10">
                <Award className="w-12 h-12 text-title" />
                <h3 className="font-heading font-bold text-[28px] uppercase text-title m-0">Leadership & Coaching</h3>
              </div>
              <ul className="space-y-6 font-body text-[18px] text-body leading-relaxed relative z-10">
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-title mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">UEFA C Diploma</strong>
                    Awarded by The Football Association (2023). Focus on structured session planning, delivery, and safety.
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-title mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">FA Level 1 in Coaching Football</strong>
                    Awarded by The Football Association (2017).
                  </div>
                </li>
              </ul>
              <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Award className="w-[300px] h-[300px]" />
              </div>
            </div>

            {/* Category 3: IT & Business */}
            <div className="bg-white p-10 lg:p-12 shadow-sm border-t-8 border-title hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-custom relative z-10">
                <MonitorDot className="w-12 h-12 text-title" />
                <h3 className="font-heading font-bold text-[28px] uppercase text-title m-0">Digital & Business</h3>
              </div>
              <ul className="space-y-6 font-body text-[18px] text-body leading-relaxed relative z-10">
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-title mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Digital & IT Skills Diploma</strong>
                    Achieved through B2W Group (2024).
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-title mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Step Into Self-Employment</strong>
                    Completed with SSG Education (2023).
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-title mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Professional Diploma in Digital Marketing</strong>
                    Westminster Business School, University of London (2016).
                  </div>
                </li>
              </ul>
            </div>

            {/* Category 4: Higher Education */}
            <div className="bg-white p-10 lg:p-12 shadow-sm border-t-8 border-theme hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-custom relative z-10">
                <GraduationCap className="w-12 h-12 text-theme" />
                <h3 className="font-heading font-bold text-[28px] uppercase text-title m-0">Higher Education</h3>
              </div>
              <ul className="space-y-6 font-body text-[18px] text-body leading-relaxed relative z-10">
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-theme mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Bachelor of Social Sciences</strong>
                    International Relations, University of Cape Town (1999).
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-theme mt-2 shrink-0"></div>
                  <div>
                    <strong className="text-title text-[20px] block mb-1">Walter H Gage Exchange Programme</strong>
                    University of British Columbia, Vancouver (1999).
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Linking CTA Block */}
      <section className="py-[80px] lg:py-[120px] bg-theme text-white border-b-8 border-title">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 relative">
                <img 
                  src="https://images.pexels.com/photos/544964/pexels-photo-544964.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Documentation and compliance in construction, showing paperwork and structural plans."
                  className="w-full h-[500px] object-cover shadow-2xl border-l-8 border-title"
                  crossOrigin="anonymous"
                />
             </div>
             <div className="order-1 lg:order-2">
                <h3 className="font-heading font-bold text-[40px] uppercase mb-8 text-white leading-[1.1]">
                  Fully Certified and Ready to Deploy
                </h3>
                <p className="font-body text-[20px] text-white/95 leading-relaxed mb-10">
                  Backed by my formal safety qualifications and comprehensive background checks, I am positioned to begin an apprenticeship or work-experience placement immediately. Discover my exact availability and the professional network validating my profile.
                </p>
                <a href="/availability" className="bg-title text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-white hover:text-title transition-colors inline-block shadow-lg">
                  View Availability & References
                </a>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
