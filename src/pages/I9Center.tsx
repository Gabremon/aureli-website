import { Link } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useMemo } from "react";
import "../styles/App.css";
import Header from "../components/Header";

const whyI9 = [
  {
    title: "Cut manual I-9 work",
    description: "with automated form completion",
  },
  {
    title: "Choose from mobile-friendly verification methods",
    description: "that meet your workers where they are",
  },
  {
    title: "Stay audit-ready",
    description: "with built-in compliance tracking and E-Verify integration",
  },
  {
    title: "Drive faster start times",
    description: "with a smoother onboarding experience",
  },
];

const capabilities = [
  "Mobile-friendly form access and verification",
  "Multiple verification options for different worker types",
  "Auto-fill and prepopulation of common fields",
  "Custom alerts and compliance dashboards",
  "E-Verify integration with status tracking",
  "Real-time status visibility for hiring managers",
];

const features = [
  {
    title: "Purpose-built",
    description: "for high-volume and hourly onboarding",
  },
  {
    title: "All-in-one dashboard",
    description: "for I-9 status, E-Verify, and worker actions",
  },
  {
    title: "Custom workflows",
    description: "for different worker groups or regions",
  },
  {
    title: "Works seamlessly",
    description: "with Aureli Onboard and your ATS",
  },
  {
    title: "Continuous updates",
    description: "from our I-9 compliance experts",
  },
  {
    title: "Agentic AI",
    description: "automates steps and flags risk proactively",
  },
];

const useCases = [
  {
    title: "Onboarding new frontline workers",
    description: "during seasonal surges",
  },
  {
    title: "Managing I-9 compliance",
    description: "for remote or distributed teams",
  },
  {
    title: "Rehiring former employees",
    description: "with updated verification",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Complete mobile-friendly forms",
    description:
      "Workers complete mobile-friendly I-9 forms, choose their verification method, and receive real-time guidance to reduce errors.",
  },
  {
    step: "2",
    title: "Get instant visibility",
    description:
      "Hiring managers get instant visibility into completion status, and your HR team stays audit-ready without chasing paperwork.",
  },
  {
    step: "3",
    title: "Stay compliant",
    description:
      "Every form is complete, accurate, and audit-ready. No delays, no manual follow-up, no audit headaches.",
  },
];

const faqs = [
  {
    question: "How does mobile-friendly I-9 completion work?",
    answer:
      "Workers can complete I-9 forms on any mobile device through a streamlined interface. The system guides them through each section, validates information in real-time, and supports multiple verification methods including remote options.",
  },
  {
    question: "Does it integrate with E-Verify?",
    answer:
      "Yes, Aureli I-9 Center integrates seamlessly with E-Verify and provides real-time status tracking. You'll see E-Verify results directly in your dashboard and receive alerts for any issues that need attention.",
  },
  {
    question: "Can I customize workflows for different worker types?",
    answer:
      "Absolutely. You can create custom workflows for different worker groups, locations, or regions. Set up different verification methods, approval processes, and alerts based on your specific needs.",
  },
  {
    question: "How does it help with audits?",
    answer:
      "Aureli I-9 Center maintains complete audit trails, tracks all form completions and modifications, and ensures every I-9 is submitted correctly and on time. Built-in compliance dashboards give you instant visibility into your I-9 status across your organization.",
  },
];

export default function I9Center() {
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
        <section className="hero hero--i9">
          <div className="hero__container">
            <div className="hero__content" data-reveal>
              <div className="hero__badge">Coming Soon</div>
              <h1 className="hero__title">
                Fast, compliant I-9s without the friction
              </h1>
              <p className="hero__subtitle">
                Complete I-9s in minutes—not days—with audit-ready workflows. Simplify I-9 completion
                and verification for your frontline workforce. No delays, no manual follow-up, no
                audit headaches.
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

        {/* Why I-9 Center Section */}
        <section className="section section--why-i9">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why Aureli I-9 Center?</h2>
              <p className="section__subtitle">
                Simplify I-9 completion and verification for your frontline workforce. No delays, no
                manual follow-up, no audit headaches.
              </p>
            </div>
            <div className="why-i9-grid">
              {whyI9.map(({ title, description }) => (
                <article className="why-i9-card" data-reveal key={title}>
                  <h3 className="why-i9-card__title">{title}</h3>
                  <p className="why-i9-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Frictionless Section */}
        <section className="section section--frictionless">
          <div className="section__container">
            <div className="frictionless-content" data-reveal>
              <h2 className="section__title">Frictionless I-9s for Every Hire</h2>
              <p className="section__subtitle">
                Aureli I-9 Center guides candidates through compliant form completion. It flags risks,
                prevents errors, and ensures every I-9 is submitted correctly and on time.
              </p>
              <a href="#features" className="frictionless-link">
                Learn More →
              </a>
            </div>
          </div>
        </section>

        {/* Built for Pace Section */}
        <section className="section section--built-pace">
          <div className="section__container">
            <div className="built-pace-content" data-reveal>
              <h2 className="section__title">Built for the pace of frontline hiring</h2>
              <p className="section__subtitle">
                Aureli I-9 Center was built for companies that move fast. With flexible verification
                methods, a mobile-first interface, and real-time alerts, you can onboard workers quickly
                and confidently without compromising on compliance. Whether you're scaling during peak
                season or rehiring returning staff, we make sure every form is complete, accurate, and
                audit-ready.
              </p>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="section section--capabilities" id="features">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">What you can do with Aureli I-9 Center</h2>
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
        <section className="section section--features-i9">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why teams choose Aureli I-9 Center</h2>
            </div>
            <div className="features-i9-grid">
              {features.map(({ title, description }) => (
                <article className="feature-i9-card" data-reveal key={title}>
                  <h3 className="feature-i9-card__title">{title}</h3>
                  <p className="feature-i9-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section section--stats-i9">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Get I-9s done right—without the back and forth</h2>
              <p className="section__subtitle">
                I-9 automation typically delivers significant improvements in onboarding efficiency.
              </p>
            </div>
            <div className="stats-i9-grid">
              <div className="stat-i9-item" data-reveal>
                <div className="stat-i9-item__value">30%</div>
                <div className="stat-i9-item__label">reduction in onboarding time</div>
              </div>
              <div className="stat-i9-item" data-reveal>
                <div className="stat-i9-item__value">40%</div>
                <div className="stat-i9-item__label">fewer incomplete I-9s</div>
              </div>
              <div className="stat-i9-item" data-reveal>
                <div className="stat-i9-item__value">99%</div>
                <div className="stat-i9-item__label">E-Verify compliance rate</div>
              </div>
            </div>
            <div className="stats-note" data-reveal>
              <p className="stats-note__text">
                *Industry benchmarks for I-9 automation. Results may vary.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section section--use-cases">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">
                Where Aureli I-9 Center streamlines verification
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
        <section className="section section--how-i9" id="how-it-works">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">How it works</h2>
              <p className="section__subtitle">
                Workers complete mobile-friendly I-9 forms, choose their verification method, and
                receive real-time guidance to reduce errors. Hiring managers get instant visibility into
                completion status, and your HR team stays audit-ready without chasing paperwork.
              </p>
            </div>
            <div className="how-i9-grid">
              {howItWorks.map(({ step, title, description }) => (
                <article className="how-i9-card" data-reveal key={step}>
                  <div className="how-i9-card__step">{step}</div>
                  <h3 className="how-i9-card__title">{title}</h3>
                  <p className="how-i9-card__description">{description}</p>
                </article>
              ))}
            </div>
            <div className="how-i9-cta" data-reveal>
              <a href="#contact" className="how-i9-link">
                Book a demo →
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section section--cta" id="contact">
          <div className="section__container">
            <div className="cta-content-wrapper" data-reveal>
              <h2 className="cta__title">Speed up I-9s without risking compliance. Book a demo today.</h2>
              <p className="cta__subtitle">
                Get early access to Aureli I-9 Center and streamline your onboarding process.
              </p>
            </div>
            <div className="cta-form-wrapper" data-reveal>
              <div className="scheduler-intro">
                <h3 className="scheduler-intro__title">Schedule a Demo</h3>
                <p className="scheduler-intro__description">
                  Book a personalized demo with our team. We'll show you how Aureli I-9 Center can
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

