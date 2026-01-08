import { Link } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useMemo } from "react";
import "../styles/App.css";
import Header from "../components/Header";

const whyOnboard = [
  {
    title: "Mobile-first experience",
    description: "built for hourly workers",
  },
  {
    title: "Easy task completion",
    description: "document collection, and signature capture",
  },
  {
    title: "Clear visibility",
    description: "into onboarding progress and completion",
  },
  {
    title: "Smart rules",
    description: "ensure compliance by location, role, and worker type",
  },
];

const capabilities = [
  "Collect forms, IDs, and signatures digitally",
  "Assign onboarding tasks based on job or location",
  "Let new hires complete tasks in their preferred language",
  "Track progress and send reminders automatically",
  "Use audit logs and completion reports for compliance",
  "Reduce time-to-productivity and turnover risk",
];

const features = [
  {
    title: "Seamless handoff",
    description: "from hiring to onboarding",
  },
  {
    title: "Mobile-first design",
    description: "works for every worker",
  },
  {
    title: "Rules-based workflows",
    description: "for different job types and locations",
  },
  {
    title: "Automated document tracking",
    description: "and task reminders",
  },
  {
    title: "Integration",
    description: "with background checks and e-signature tools",
  },
  {
    title: "Corporate visibility",
    description: "with real-time dashboards and reports",
  },
];

const useCases = [
  {
    title: "Warehouses needing to quickly onboard",
    description: "seasonal hires",
  },
  {
    title: "Restaurants standardizing onboarding",
    description: "across franchises",
  },
  {
    title: "Retail brands improving compliance",
    description: "and training visibility",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Automatic enrollment",
    description:
      "New hires are automatically enrolled into onboarding once they accept an offer. From there, they complete forms, upload documents, and get job-ready all from their phone.",
  },
  {
    step: "2",
    title: "Customize workflows",
    description:
      "Your team can customize tasks and workflows for each location or role, ensuring every new hire gets the right onboarding experience.",
  },
  {
    step: "3",
    title: "Stay on top of everything",
    description:
      "Track progress with live dashboards, automated reminders, and real-time visibility into completion status. No manual follow-up needed.",
  },
];

const faqs = [
  {
    question: "How does mobile-first onboarding work?",
    answer:
      "New hires can complete their entire onboarding process from their mobile device. They receive tasks, upload documents, sign forms, and track their progress—all from their phone. The interface is designed specifically for hourly workers who may not have access to a computer.",
  },
  {
    question: "Can I customize onboarding workflows for different roles?",
    answer:
      "Yes, Aureli Onboard allows you to create rules-based workflows for different job types, locations, and worker categories. Each workflow can have its own set of tasks, documents, and compliance requirements.",
  },
  {
    question: "How does it integrate with the hiring process?",
    answer:
      "Aureli Onboard seamlessly connects with your hiring workflow. Once a candidate accepts an offer, they're automatically enrolled in onboarding. The system can also integrate with background checks, e-signature tools, and your ATS.",
  },
  {
    question: "What kind of visibility do I get?",
    answer:
      "You get real-time dashboards showing onboarding progress across all new hires, completion rates, pending tasks, and compliance status. Automated reminders help keep things moving, and audit logs ensure you're always ready for compliance reviews.",
  },
];

export default function Onboard() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: { "cal-brand": "#2563eb" },
          dark: { "cal-brand": "#2563eb" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className="page">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="hero hero--onboard">
          <div className="hero__container">
            <div className="hero__content" data-reveal>
              <div className="hero__badge">Coming Soon</div>
              <h1 className="hero__title">
                Get new hires to day one 2x faster with fewer errors
              </h1>
              <p className="hero__subtitle">
                Gets new employees ready to work faster and keeps your team compliant every step of the
                way. Make a great first impression, reduce errors, and get ahead of Day 1 chaos with a
                fully digital, mobile-ready onboarding experience.
              </p>
              <div className="hero__actions">
                <a className="hero__primary" href="#contact">
                  Get Started
                </a>
                <a className="hero__secondary" href="#how-it-works">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Onboard Section */}
        <section className="section section--why-onboard">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why Aureli Onboard?</h2>
              <p className="section__subtitle">
                Make a great first impression, reduce errors, and get ahead of Day 1 chaos with a fully
                digital, mobile-ready onboarding experience.
              </p>
            </div>
            <div className="why-onboard-grid">
              {whyOnboard.map(({ title, description }) => (
                <article className="why-onboard-card" data-reveal key={title}>
                  <h3 className="why-onboard-card__title">{title}</h3>
                  <p className="why-onboard-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Faster Starts Section */}
        <section className="section section--faster-starts">
          <div className="section__container">
            <div className="faster-starts-content" data-reveal>
              <h2 className="section__title">Faster, Smarter Starts for New Hires</h2>
              <p className="section__subtitle">
                Aureli Onboard keeps new hires moving. It nudges candidates to complete steps, surfaces
                bottlenecks, and gets people to day one faster—without manual follow-up.
              </p>
              <a href="#features" className="faster-starts-link">
                Learn more →
              </a>
            </div>
          </div>
        </section>

        {/* Fast Flexible Section */}
        <section className="section section--fast-flexible">
          <div className="section__container">
            <div className="fast-flexible-content" data-reveal>
              <h2 className="section__title">Fast, flexible, and fully digital</h2>
              <p className="section__subtitle">
                When you're hiring at volume, paper packets and email checklists just won't cut it.
                Aureli Onboard turns a messy manual process into a smooth experience for new hires and
                your team alike. Let them complete onboarding from their phone, while you track
                everything in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="section section--capabilities" id="features">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">What you can do with Aureli Onboard</h2>
            </div>
            <div className="capabilities-grid">
              {capabilities.map((capability, index) => (
                <div className="capability-item" data-reveal key={index}>
                  <div className="capability-item__check">✓</div>
                  <p className="capability-item__text">{capability}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="section section--features-onboard">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why teams choose Aureli Onboard</h2>
            </div>
            <div className="features-onboard-grid">
              {features.map(({ title, description }) => (
                <article className="feature-onboard-card" data-reveal key={title}>
                  <h3 className="feature-onboard-card__title">{title}</h3>
                  <p className="feature-onboard-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section section--stats-onboard">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Fewer errors. Faster first days.</h2>
              <p className="section__subtitle">
                Digital onboarding typically delivers significant improvements in speed and compliance.
              </p>
            </div>
            <div className="stats-onboard-grid">
              <div className="stat-onboard-item" data-reveal>
                <div className="stat-onboard-item__value">40%</div>
                <div className="stat-onboard-item__label">faster onboarding completion</div>
              </div>
              <div className="stat-onboard-item" data-reveal>
                <div className="stat-onboard-item__value">30%</div>
                <div className="stat-onboard-item__label">reduction in Day 1 no-shows</div>
              </div>
              <div className="stat-onboard-item" data-reveal>
                <div className="stat-onboard-item__value">2x</div>
                <div className="stat-onboard-item__label">improvement in compliance task completion rates</div>
              </div>
            </div>
            <div className="stats-note" data-reveal>
              <p className="stats-note__text">
                *Industry benchmarks for digital onboarding. Results may vary.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section section--use-cases">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">
                Where Aureli Onboard improves speed and compliance
              </h2>
            </div>
            <div className="use-cases-grid">
              {useCases.map(({ title, description }) => (
                <article className="use-case-card" data-reveal key={title}>
                  <h3 className="use-case-card__title">{title}</h3>
                  <p className="use-case-card__description">{description}</p>
                </article>
              ))}
            </div>
            <div className="use-cases-cta" data-reveal>
              <a href="#contact" className="use-cases-link">
                Get a tailored demo for your use case →
              </a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section section--how-onboard" id="how-it-works">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">How it works</h2>
              <p className="section__subtitle">
                New hires are automatically enrolled into onboarding once they accept an offer. From
                there, they complete forms, upload documents, and get job-ready all from their phone.
                Your team can customize tasks and workflows for each location or role, and stay on top
                of everything with live dashboards.
              </p>
            </div>
            <div className="how-onboard-grid">
              {howItWorks.map(({ step, title, description }) => (
                <article className="how-onboard-card" data-reveal key={step}>
                  <div className="how-onboard-card__step">{step}</div>
                  <h3 className="how-onboard-card__title">{title}</h3>
                  <p className="how-onboard-card__description">{description}</p>
                </article>
              ))}
            </div>
            <div className="how-onboard-cta" data-reveal>
              <a href="#contact" className="how-onboard-link">
                Book a demo →
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section section--cta" id="contact">
          <div className="section__container">
            <div className="cta-content-wrapper" data-reveal>
              <h2 className="cta__title">
                See how Aureli Onboard saves time, reduces errors, and gets your new hires ready faster.
                Book a demo today.
              </h2>
              <p className="cta__subtitle">
                Get early access to Aureli Onboard and transform your onboarding process.
              </p>
            </div>
            <div className="cta-form-wrapper" data-reveal>
              <div className="scheduler-intro">
                <h3 className="scheduler-intro__title">Schedule a Demo</h3>
                <p className="scheduler-intro__description">
                  Book a personalized demo with our team. We'll show you how Aureli Onboard can
                  transform your onboarding process.
                </p>
              </div>
              <div className="scheduler-embed" aria-live="polite" style={{ minHeight: "520px" }}>
                <Cal
                  namespace="30min"
                  calLink="ali-sulaiman-b2yeyp/30min"
                  style={{ width: "100%", height: "100%", overflow: "scroll" }}
                  config={{ layout: "month_view", theme: "light" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section--faq" id="faq">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Frequently asked questions</h2>
            </div>
            <div className="faq-list">
              {faqs.map(({ question, answer }) => (
                <details className="faq-item" data-reveal key={question}>
                  <summary className="faq-item__question">{question}</summary>
                  <p className="faq-item__answer">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__container">
          <div className="footer__brand">
            <span className="footer__logo">Aureli</span>
            <p className="footer__tagline">Predictive Hiring Intelligence</p>
          </div>
          <nav className="footer__nav" aria-label="Footer navigation">
            <div className="footer__column">
              <h4 className="footer__heading">Product</h4>
              <Link to="/hire">Hire</Link>
              <Link to="/referrals">Referrals</Link>
              <Link to="/i9-center">I-9 Center</Link>
              <Link to="/onboard">Onboard</Link>
              <Link to="/compliance">Compliance</Link>
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer__column">
              <h4 className="footer__heading">Company</h4>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer__column">
              <h4 className="footer__heading">Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </nav>
        </div>
        <div className="footer__bottom">
          <p>&copy; {currentYear} Aureli. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

