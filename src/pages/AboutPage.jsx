import { motion } from 'framer-motion';
import { FiEye, FiTarget, FiAward, FiUsers, FiClock, FiHeart } from 'react-icons/fi';
import team from '../data/team';
import Counter from '../components/ui/Counter';
import SectionTitle from '../components/ui/SectionTitle';
import ScrollReveal from '../components/ui/ScrollReveal';
import heroGlasses from '../assets/images/hero-glasses.png';
import './AboutPage.css';

const TIMELINE_MILESTONES = [
  {
    year: '2010',
    title: 'Founding of OPTICA',
    description: 'We started with a single brick-and-mortar boutique in Soho, NY, with a vision to redefine luxury eye diagnostics and curated designer frames.',
    icon: <FiAward />,
  },
  {
    year: '2013',
    title: 'Flagship Store Expansion',
    description: 'Opened our flagship store with a dedicated state-of-the-art vision clinic and introduced our first custom in-house frame line.',
    icon: <FiClock />,
  },
  {
    year: '2016',
    title: 'Global Online Launch',
    description: 'Launched our digital storefront, making luxury prescription eyewear accessible nationwide with an advanced online fitting guide.',
    icon: <FiEye />,
  },
  {
    year: '2019',
    title: '100,000+ Happy Eyes',
    description: 'Celebrated the milestone of serving over 100,000 clients, expanding our premium partnerships to include exclusive European houses.',
    icon: <FiUsers />,
  },
  {
    year: '2023',
    title: 'Premium Eco-Collection',
    description: 'Unveiled our signature handcrafted Titanium and Bio-Acetate collection, combining ultra-lightweight durability with zero-impact styling.',
    icon: <FiHeart />,
  },
];

export default function AboutPage() {
  return (
    <div className="about-page page">
      {/* Hero Banner */}
      <div className="about-banner">
        <div className="container">
          <div className="about-banner-content">
            <h1 className="about-banner-title gradient-text">About OPTICA</h1>
            <p className="about-banner-subtitle">
              Redefining eye care and high-fashion eyewear with custom luxury craftsmanship since 2010.
            </p>
          </div>
        </div>
      </div>

      {/* Company Introduction */}
      <section className="about-intro-section">
        <div className="container">
          <div className="about-intro-grid">
            <ScrollReveal direction="left" className="about-intro-img-wrapper">
              <div className="intro-img-frame glass-card">
                <img src={heroGlasses} alt="Premium Luxury Eyewear" className="intro-image" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="about-intro-text-pane">
              <span className="section-label">Our Story</span>
              <h2 className="intro-title">Crafting Vision & Style</h2>
              <p className="intro-paragraph">
                At OPTICA, we believe that eyewear is more than just a medical necessity — it is an extension of your persona, a key fashion statement, and a medium through which you experience the world. For over a decade, we have married cutting-edge optical diagnostic technology with the world’s most exquisite handmade frame materials.
              </p>
              <p className="intro-paragraph">
                Our frames are sourced from top design houses in Italy and France, using custom bio-acetates, Japanese titanium, and precision-engineered hinge hardware. Each prescription lens is crafted to order in our specialized lab, featuring premium anti-reflective, scratch-resistant, and blue-light protection coatings.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mission-section">
        <div className="container">
          <div className="mission-vision-grid">
            <ScrollReveal direction="up" delay={0.1} className="mission-card glass-card">
              <div className="mission-icon-container">
                <FiTarget />
              </div>
              <h3>Our Mission</h3>
              <p>
                To deliver ultimate vision clarity and eye health security through clinical excellence, while styling our clients in handcrafted, premium frames that reflect their unique personality. We aim to merge medical precision with luxury design.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} className="mission-card glass-card">
              <div className="mission-icon-container">
                <FiEye />
              </div>
              <h3>Our Vision</h3>
              <p>
                To be the global destination for discerning individuals seeking premium eye care, setting the standard for sustainable luxury styling, digital lens innovation, and a personalized, wow-factor customer experience.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="about-timeline-section">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              subtitle="Our Journey"
              title="Milestones of Excellence"
              description="A timeline of how we grew from a boutique Soho clinic into a premier luxury eyewear destination."
            />
          </ScrollReveal>

          <div className="timeline-container">
            <div className="timeline-spine" />

            {TIMELINE_MILESTONES.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={milestone.year}
                  className={`timeline-row ${isEven ? 'row-left' : 'row-right'}`}
                >
                  {/* Spine Node */}
                  <div className="timeline-node">
                    {milestone.icon}
                  </div>

                  {/* Card Content */}
                  <ScrollReveal direction={isEven ? 'left' : 'right'} className="timeline-card-wrapper">
                    <div className="timeline-card glass-card">
                      <span className="milestone-year">{milestone.year}</span>
                      <h4 className="milestone-title">{milestone.title}</h4>
                      <p className="milestone-desc">{milestone.description}</p>
                    </div>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-stats-section">
        <div className="container">
          <div className="about-stats-grid glass-card">
            <div className="stats-col">
              <Counter end={50000} suffix="+" duration={1.5} />
              <span className="stats-label">Customers Served</span>
            </div>
            <div className="stats-col">
              <Counter end={10000} suffix="+" duration={1.5} />
              <span className="stats-label">Products Handcrafted</span>
            </div>
            <div className="stats-col">
              <Counter end={14} suffix="+" duration={1.5} />
              <span className="stats-label">Years of Experience</span>
            </div>
            <div className="stats-col">
              <Counter end={99} suffix="%" duration={1.5} />
              <span className="stats-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team-section">
        <div className="container">
          <ScrollReveal>
            <SectionTitle
              subtitle="The Experts"
              title="Meet Our Vision Team"
              description="Our store is staffed by certified optometrists, clinical technicians, and high-fashion frame stylists."
            />
          </ScrollReveal>

          <div className="team-cards-grid">
            {team.map((member, index) => (
              <ScrollReveal
                key={member.id}
                direction="up"
                delay={index * 0.1}
                className="team-member-card-wrapper"
              >
                <div className="team-member-card glass-card">
                  <div className="team-member-avatar-circle">
                    <span className="avatar-initials">{member.initials}</span>
                  </div>
                  <h4 className="member-name">{member.name}</h4>
                  <span className="member-role">{member.role}</span>
                  <p className="member-bio">{member.bio}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
