import PageBanner from '../components/PageBanner';
import { CalendarCheck, FileCheck2, UserCheck, ShieldCheck } from 'lucide-react';

export default function AvailabilityReferences() {
  return (
    <div className="bg-[#F7F7F7]">
      <PageBanner title="Availability & References" breadcrumb="Availability & Referencing" />
      
      {/* Availability Profile */}
      <section className="py-[80px] lg:py-[120px] border-b border-border-custom bg-white">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             <div>
               <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex items-center gap-3">
                 <span className="w-12 h-[3px] bg-theme inline-block"></span> Working Status
               </h4>
               <h2 className="font-heading font-bold text-[40px] md:text-[50px] text-title uppercase leading-[1.1] mb-8">
                 Ready For Immediate Deployment
               </h2>
               <p className="font-body text-[20px] text-body leading-relaxed mb-6">
                 I am thoroughly prepared to enter an apprenticeship or paid work-experience placement with minimal lead time.
               </p>
               <p className="font-body text-[20px] text-body leading-relaxed">
                 My transition into the built environment is fully supported by the Department for Work and Pensions (DWP) through the Connect to Work framework, ensuring a smooth and structured onboarding process.
               </p>
             </div>

             <div className="bg-title text-white p-10 lg:p-14 shadow-2xl">
                <h3 className="font-heading font-bold text-[30px] uppercase mb-8 border-b border-white/20 pb-6 flex items-center gap-4">
                   <CalendarCheck className="w-10 h-10 text-theme" /> Verified Availability
                </h3>
                <ul className="space-y-6 font-body text-[18px] text-white/90 leading-relaxed">
                  <li className="flex items-start gap-4">
                    <span className="text-theme font-bold text-[24px] mt-[-4px]">✓</span>
                    Available to start at incredibly short notice.
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-theme font-bold text-[24px] mt-[-4px]">✓</span>
                    Full, clean UK driving licence. Able to drive to sites across Bedfordshire and surrounding limits.
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-theme font-bold text-[24px] mt-[-4px]">✓</span>
                    Eligible to work in the UK without restriction.
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-theme font-bold text-[24px] mt-[-4px]">✓</span>
                    Enhanced DBS cleared.
                  </li>
                </ul>
             </div>
          </div>
        </div>
      </section>

      {/* References Matrix */}
      <section className="py-[80px] lg:py-[120px]">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="text-center mb-16">
            <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex justify-center items-center gap-3">
              <span className="w-12 h-[3px] bg-theme inline-block"></span> Validation
            </h4>
            <h2 className="font-heading font-bold text-[40px] md:text-[50px] text-title uppercase leading-[1.1]">
              References Matrix
            </h2>
            <p className="font-body text-[18px] text-body mt-6 max-w-[800px] mx-auto">
              Professional and character references are available immediately upon request. The extensive network built over 20 years ensures robust verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-10 border-t-4 border-theme shadow-lg hover:-translate-y-2 transition-transform duration-300">
              <CalendarCheck className="w-12 h-12 text-theme mb-6" />
               <h4 className="font-heading font-bold text-title uppercase text-[22px] mb-3">Connect to Work</h4>
               <p className="font-body text-[16px] text-body leading-relaxed mb-6">
                 Verified by Job Coach: Zain Ahmed. Facilitated through Luton Council Directorate of Inclusive Growth.
               </p>
               <span className="inline-block bg-grey text-title font-heading font-bold text-[14px] uppercase px-4 py-2 border border-border-custom">Status Validation</span>
            </div>

            <div className="bg-white p-10 border-t-4 border-theme shadow-lg hover:-translate-y-2 transition-transform duration-300">
               <ShieldCheck className="w-12 h-12 text-theme mb-6" />
               <h4 className="font-heading font-bold text-title uppercase text-[22px] mb-3">Tick Education Ltd</h4>
               <p className="font-body text-[16px] text-body leading-relaxed mb-6">
                 Validation of classroom management, strict attendance, and adherence to rigorous safeguarding protocols.
               </p>
               <span className="inline-block bg-grey text-title font-heading font-bold text-[14px] uppercase px-4 py-2 border border-border-custom">Reliability Check</span>
            </div>

            <div className="bg-white p-10 border-t-4 border-theme shadow-lg hover:-translate-y-2 transition-transform duration-300">
               <FileCheck2 className="w-12 h-12 text-theme mb-6" />
               <h4 className="font-heading font-bold text-title uppercase text-[22px] mb-3">Luton Town Foundation</h4>
               <p className="font-body text-[16px] text-body leading-relaxed mb-6">
                 Verified coaching reliability, cross-cultural community interaction, and outdoor operational execution.
               </p>
               <span className="inline-block bg-grey text-title font-heading font-bold text-[14px] uppercase px-4 py-2 border border-border-custom">Logistics Check</span>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded CTA */}
      <section className="py-[80px] lg:py-[120px] bg-theme text-white border-b-8 border-title">
        <div className="max-w-[1170px] mx-auto px-[15px] text-center">
            <h3 className="font-heading font-bold text-[35px] md:text-[45px] uppercase mb-8">
              Proceed to Full Contact Details
            </h3>
            <p className="font-body text-[20px] text-white/90 leading-relaxed max-w-[800px] mx-auto mb-10">
              I am prepared to immediately provide medical documentation, driving documents, my full CV, and my DBS certificate securely upon formal request.
            </p>
            <a href="/contact" className="bg-title text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-white hover:text-title transition-colors inline-flex shadow-xl">
              Access Contact Information
            </a>
        </div>
      </section>
    </div>
  );
}
