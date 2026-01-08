import { Link } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useMemo } from "react";
import "../styles/App.css";
import Header from "../components/Header";

const whyCompliance = [
  {
    title: "Avoid legal risk",
    description: "and always be audit-ready",
  },
  {
    title: "Automate document checks",
    description: "with trigger-based workflows",
  },
  {
    title: "Apply the same rules",
    description: "across every location and role",
  },
  {
    title: "Cut down manual review time",
    description: "with instant external validation",
  },
];

const capabilities = [
  "Automate collection of IDs, licenses, and credentials",
  "Flag missing or incorrect documentation in real time",
  "Set custom rules by region, role, or worker type",
  "Get proactive alerts before compliance issues impact your business",
  "Secure, mobile-friendly uploads for workers",
  "Full audit trail and reporting tools",
];

const features = [
  {
    title: "Built for",
    description: "hourly hiring workflows",
  },
  {
    title: "Real-time",
    description: "document validation and alerts",
  },
  {
    title: "Role-based",
    description: "and geo-specific rule configuration",
  },
  {
    title: "Mobile-first",
    description: "interface for document upload",
  },
  {
    title: "Detailed audit logs",
    description: "and exportable reports",
  },
  {
    title: "Agentic AI",
    description: "that catches errors and suggests corrections",
  },
];

const useCases = [
  {
    title: "Companies managing different labor laws",
    description: "by state or region",
  },
  {
    title: "Roles that require credentials",
    description: "licenses, or certifications",
  },
  {
    title: "Organizations enforcing internal policy",
    description: "compliance by role or brand",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Worker uploads document",
    description: "Workers upload required documents through a mobile-friendly interface.",
  },
  {
    step: "2",
    title: "Trigger fires automatically",
    description: "The system automatically detects document uploads and triggers compliance checks.",
  },
  {
    step: "3",
    title: "External processing",
    description: "Documents are sent to your system or vendor for validation and verification.",
  },
  {
    step: "4",
    title: "Instant approval or flag",
    description: "Get instant approval, flag issues, or trigger next steps based on validation results.",
  },
];

const faqs = [
  {
    question: "How does automated compliance checking work?",
    answer:
      "Aureli Compliance automatically validates documents as they're uploaded. The system checks for completeness, expiration dates, and required information. Custom rules can be set by role, location, or worker type, and the system flags issues in real-time before they become problems.",
  },
  {
    question: "Can I set different compliance rules for different locations?",
    answer:
      "Yes, Aureli Compliance allows you to configure role-based and geo-specific rules. You can set different requirements for different states, regions, job types, or even specific locations. The system automatically applies the right rules to each hire.",
  },
  {
    question: "What kind of documents can be validated?",
    answer:
      "Aureli Compliance can validate IDs, licenses, certifications, credentials, and other required documents. The system integrates with external validation services and can check expiration dates, authenticity, and completeness. You can also set custom validation rules for company-specific requirements.",
  },
  {
    question: "How does it help with audits?",
    answer:
      "Aureli Compliance maintains a complete audit trail of all document uploads, validations, and compliance checks. You get detailed logs and exportable reports that show exactly what was checked, when, and by whom. This ensures you're always audit-ready without manual documentation.",
  },
];

export default function Compliance() {
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
        <section className="hero hero--compliance">
          <div className="hero__container">
            <div className="hero__content" data-reveal>
              <div className="hero__badge">Coming Soon</div>
              <h1 className="hero__title">
                Stay compliant without slowing hiring
              </h1>
              <p className="hero__subtitle">
                Keep every hire on track with guardrails, instant checks, and workflows that start the
                moment a document is uploaded. Hiring at scale comes with compliance risk. Aureli
                Compliance keeps you protected without creating bottlenecks.
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

        {/* Why Compliance Section */}
        <section className="section section--why-compliance">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why Aureli Compliance?</h2>
              <p className="section__subtitle">
                Hiring at scale comes with compliance risk. Aureli Compliance keeps you protected without
                creating bottlenecks. Built for high-volume teams, it ensures every hire meets your
                standards, every time.
              </p>
            </div>
            <div className="why-compliance-grid">
              {whyCompliance.map(({ title, description }) => (
                <article className="why-compliance-card" data-reveal key={title}>
                  <h3 className="why-compliance-card__title">{title}</h3>
                  <p className="why-compliance-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Smart Guardrails Section */}
        <section className="section section--guardrails">
          <div className="section__container">
            <div className="guardrails-content" data-reveal>
              <h2 className="section__title">Smart Guardrails for Confident Hiring</h2>
              <p className="section__subtitle">
                Aureli Compliance applies the right rules to every role. It flags issues, checks
                documentation, and helps teams stay audit-ready without slowing down hiring.
              </p>
              <a href="#features" className="guardrails-link">
                Learn more →
              </a>
            </div>
          </div>
        </section>

        {/* Compliance Speed Section */}
        <section className="section section--compliance-speed">
          <div className="section__container">
            <div className="compliance-speed-content" data-reveal>
              <h2 className="section__title">Compliance shouldn't slow you down</h2>
              <p className="section__subtitle">
                Staying compliant is hard when you're hiring fast, across locations, and at scale. Aureli
                Compliance removes the friction by embedding smart checks into your hiring flow. From
                document capture to company-specific rules, we help you move quickly without missing a
                step.
              </p>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="section section--capabilities" id="features">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">What you can do with Aureli Compliance</h2>
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
        <section className="section section--features-compliance">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why teams trust Aureli Compliance</h2>
            </div>
            <div className="features-compliance-grid">
              {features.map(({ title, description }) => (
                <article className="feature-compliance-card" data-reveal key={title}>
                  <h3 className="feature-compliance-card__title">{title}</h3>
                  <p className="feature-compliance-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section section--stats-compliance">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Stay compliant without slowing down hiring</h2>
              <p className="section__subtitle">
                Automated compliance typically delivers significant improvements in efficiency and audit readiness.
              </p>
            </div>
            <div className="stats-compliance-grid">
              <div className="stat-compliance-item" data-reveal>
                <div className="stat-compliance-item__value">100%</div>
                <div className="stat-compliance-item__label">audit readiness across all locations</div>
              </div>
              <div className="stat-compliance-item" data-reveal>
                <div className="stat-compliance-item__value">60%</div>
                <div className="stat-compliance-item__label">reduction in manual compliance work</div>
              </div>
              <div className="stat-compliance-item" data-reveal>
                <div className="stat-compliance-item__value">50%</div>
                <div className="stat-compliance-item__label">faster onboarding time</div>
              </div>
            </div>
            <div className="stats-note" data-reveal>
              <p className="stats-note__text">
                *Industry benchmarks for automated compliance. Results may vary.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section section--use-cases">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">
                Where Aureli Compliance keeps hiring on track
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
        <section className="section section--how-compliance" id="how-it-works">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">How it works</h2>
            </div>
            <div className="how-compliance-grid">
              {howItWorks.map(({ step, title, description }) => (
                <article className="how-compliance-card" data-reveal key={step}>
                  <div className="how-compliance-card__step">{step}</div>
                  <h3 className="how-compliance-card__title">{title}</h3>
                  <p className="how-compliance-card__description">{description}</p>
                </article>
              ))}
            </div>
            <div className="how-compliance-cta" data-reveal>
              <a href="#contact" className="how-compliance-link">
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
                See automated compliance in action
              </h2>
              <p className="cta__subtitle">
                Book a demo and see how Aureli Compliance helps you hire quickly without cutting compliance corners.
              </p>
            </div>
            <div className="cta-form-wrapper" data-reveal>
              <div className="scheduler-intro">
                <h3 className="scheduler-intro__title">Schedule a Demo</h3>
                <p className="scheduler-intro__description">
                  Book a personalized demo with our team. We'll show you how Aureli Compliance can
                  transform your hiring process.
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

