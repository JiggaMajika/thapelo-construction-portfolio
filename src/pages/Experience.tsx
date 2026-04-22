import PageBanner from '../components/PageBanner';
import { motion } from 'motion/react';

export default function Experience() {
  const experiences = [
    {
      role: "Sales Assistant (part-time)",
      company: "House of Fraser / One Beyond Retail, Luton",
      period: "2024 – Present",
      bullets: [
        "Customer-facing floor role in a fast-paced retail environment, processing transactions, stock replenishment, merchandising and resolving customer issues.",
        "Played a key role in the One Beyond Luton store relaunch, working to tight deadlines alongside a multi-skilled team.",
        "Maintained consistent attendance and absolute reliability across variable shift patterns."
      ]
    },
    {
      role: "Cover Supervisor / Teaching Assistant / PE Teacher",
      company: "Tick Education Ltd, Luton schools",
      period: "Nov 2021 – Oct 2024",
      bullets: [
        "Managed classrooms across a variety of subjects, including PE and sports sessions in Luton primary and secondary schools.",
        "Worked across sports field and classroom environments, demonstrating adaptability, authority and clear communication with groups of 20 to 30.",
        "Maintained Enhanced DBS clearance and a strong record of strict safeguarding compliance."
      ]
    },
    {
      role: "SPC Football Coach",
      company: "Luton Town FC Foundation In The Community",
      period: "May 2021 – Aug 2023",
      bullets: [
        "UEFA C-licensed coach delivering structured, safety-first sessions for children and young people across Luton.",
        "Planned and led sessions including warm-ups and injury-prevention routines, working reliably in outdoor environments in all weather conditions.",
        "Engaged directly with parents, club staff and safeguarding leads, demonstrating clear professionalism in a community-facing role."
      ]
    },
    {
      role: "Hospitality Supervisor (part-time)",
      company: "Delaware North at Levy Restaurants, Tottenham Hotspur Stadium",
      period: "Aug 2018 – Mar 2020",
      bullets: [
        "Supervised a small hospitality team on matchdays at the high-volume White Hart Lane / Tottenham Hotspur Stadium.",
        "Ensured proper preparation of catering stations before kick-off, implementing strict health and safety regulations throughout major events.",
        "Liaised with chefs to maintain standards, conducted accurate stock-takes, and managed fast-paced back-of-house operations."
      ]
    },
    {
      role: "Corporate Hospitality Supervisor / Manager (full-time)",
      company: "Blue Apple at CAPITA, City of London",
      period: "Jun 2018 – Jan 2020",
      bullets: [
        "Full-time supervisory role planning weekly service across catering units and meeting offices spanning eight floors.",
        "Coordinated stringent dietary and technical requirements for seminars and corporate events using the Condeco system.",
        "Managed store rooms, controlled stock rotation/replenishment, and oversaw preparation of service tables.",
        "Supervised a team of assistants and coordinated directly with the CAPITA reception desk for bespoke service requests."
      ]
    },
    {
      role: "Hospitality Assistant (part-time)",
      company: "Delaware North, London stadiums",
      period: "Jan 2016 – Sep 2018",
      bullets: [
        "Managed daily operations and cash handling at the Chapmans food kiosk (Arsenal) and served as Event bar cashier at Highbury House, Wembley, Emirates, London Stadium, and Craven Cottage.",
        "Assisted with time-critical logistics preparation for high-level meetings and sporting events, remaining exceptionally reliable in fast-paced, highly regulated environments."
      ]
    },
    {
      role: "Fulfilment Centre Associate",
      company: "Amazon Fulfilment Centre, Hemel Hempstead",
      period: "May 2015 – Dec 2015",
      bullets: [
        "Warehouse-floor role focused on order picking, scanning, and inventory handling.",
        "Worked to strict daily productivity and throughput targets within a massive operational team structure.",
        "Gained direct, hands-on experience in a high-volume, PPE-aware, SOP-driven industrial environment."
      ]
    },
    {
      role: "Founder (Digital Content Consultancy)",
      company: "Global Media Content, London",
      period: "May 2019 – Dec 2022",
      bullets: [
        "Ran a small client-facing business end-to-end, handling project planning, delivery, and administration.",
        "Demonstrated intense self-discipline, time management, and the ability to own total responsibility for project outcomes."
      ]
    }
  ];

  return (
    <div className="bg-[#F7F7F7]">
      <PageBanner title="Experience" breadcrumb="Experience" />
      
      <section className="py-[80px] lg:py-[120px]">
        <div className="max-w-[1000px] mx-auto px-[15px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 max-w-[800px] mx-auto"
          >
             <h4 className="font-heading uppercase font-bold text-theme tracking-[0.11em] text-[18px] mb-4 flex justify-center items-center gap-3">
                <span className="w-12 h-[3px] bg-theme inline-block"></span> Work History
              </h4>
              <h2 className="font-heading font-bold text-[40px] md:text-[50px] text-title uppercase leading-[1.1] mb-6">
                A Track Record of Reliability
              </h2>
              <p className="font-body text-[18px] text-body leading-relaxed">
                Spanning over two decades, my professional background showcases a definitive ability to operate within heavily regulated environments, supervise complex operations, and maintain excellent attendance records under pressure.
              </p>
          </motion.div>

          <div className="space-y-10">
            {experiences.map((exp, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 md:p-12 border-l-8 border-title shadow-md hover:border-theme hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-grey px-6 py-3 font-heading font-bold text-theme text-[16px] uppercase tracking-wider rounded-bl-2xl">
                  {exp.period}
                </div>
                
                <h3 className="font-heading font-bold text-[28px] md:text-[32px] text-title mb-2 uppercase pr-32">
                  {exp.role}
                </h3>
                <p className="font-heading text-theme font-bold text-[18px] uppercase tracking-wide mb-6">
                  {exp.company}
                </p>
                
                <ul className="space-y-4">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-4 text-[18px] font-body text-body leading-relaxed">
                       <span className="w-2 h-2 mt-2.5 rounded-full bg-theme shrink-0"></span>
                       {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Capabilities CTA */}
      <section className="py-[80px] lg:py-[120px] bg-white border-t border-border-custom border-b-8 border-theme">
        <div className="max-w-[1170px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="order-2 md:order-1 relative">
                <img 
                  src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Construction worker holding tools, signifying practical transition. No face shown."
                  className="w-full h-[400px] object-cover shadow-2xl border-l-8 border-theme"
                  crossOrigin="anonymous"
                />
             </div>
             <div className="order-1 md:order-2">
                <h3 className="font-heading font-bold text-[35px] uppercase text-title mb-6 leading-[1.2]">From Operations to Practical Execution</h3>
                <p className="font-body text-[20px] text-body leading-relaxed mb-8">
                  My extensive employment history proves that I am highly dependable, capable of executing complex instructions, and accustomed to stringent safety standards. See how these traits translate directly into tangible competencies for the construction sector.
                </p>
                <a href="/skills" className="inline-block bg-theme text-white font-heading font-bold uppercase text-[18px] px-[45px] py-[22px] hover:bg-title transition-colors shadow-lg">
                  View Practical Skills
                </a>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
