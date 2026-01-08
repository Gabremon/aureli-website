import { Link } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useMemo } from "react";
import "../styles/App.css";
import Header from "../components/Header";

const whyReferrals = [
  {
    title: "High-retention hires",
    description: "from trusted sources",
  },
  {
    title: "Fewer steps",
    description: "faster conversions",
  },
  {
    title: "Easy mobile experience",
    description: "for employees and candidates",
  },
  {
    title: "Automated from end to end",
    description: "no manual tracking",
  },
];

const capabilities = [
  "Reduce no-show rates and early turnover",
  "Cut sourcing spend without losing quality",
  "Eliminate manual work with auto-tracking and reporting",
  "Incentivize effectively with flexible reward settings",
  "Reach frontline workers through SMS and mobile workflows",
  "Measure impact with real-time data",
];

const features = [
  {
    title: "Mobile-first",
    description: "referral experience for on-the-go workers",
  },
  {
    title: "Refer via text",
    description: "using auto-generated links and QR codes with no app required",
  },
  {
    title: "Real-time",
    description: "referral tracking and engagement insights",
  },
  {
    title: "Configurable reward settings",
    description: "based on hire status",
  },
  {
    title: "Easy campaign creation",
    description: "for recruiters and managers",
  },
  {
    title: "Fully integrated",
    description: "with your hiring workflows in Aureli",
  },
];

const useCases = [
  {
    title: "Launch referral campaigns",
    description: "for peak season hiring",
  },
  {
    title: "Target hard-to-fill roles",
    description: "with focused incentive programs",
  },
  {
    title: "Engage and reward",
    description: "your top-performing employees",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Share open roles",
    description:
      "Employees instantly share open roles with their networks via text, QR code, or a mobile-friendly page.",
  },
  {
    step: "2",
    title: "Track every step",
    description:
      "Aureli Referrals tracks every step, from referral sent to hired, and keeps your team informed.",
  },
  {
    step: "3",
    title: "Get results",
    description:
      "No spreadsheets, no follow-ups. Just results. Fill roles faster with people your team already trusts.",
  },
];

const faqs = [
  {
    question: "How do employees share referrals?",
    answer:
      "Employees can share open roles instantly via text message, QR code, or a mobile-friendly referral page. No app download required—just click and share.",
  },
  {
    question: "How are referrals tracked?",
    answer:
      "Aureli Referrals automatically tracks every referral from the moment it's sent through to hire. You get real-time insights into referral status, engagement, and conversion rates—no manual tracking needed.",
  },
  {
    question: "Can I customize reward settings?",
    answer:
      "Yes, you can configure reward settings based on hire status, role type, or other criteria. Set different incentives for different campaigns and roles.",
  },
  {
    question: "Does it integrate with my existing hiring tools?",
    answer:
      "Aureli Referrals integrates seamlessly with your hiring workflows in Aureli and can connect with your existing HRIS and ATS systems.",
  },
];

export default function Referrals() {
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
        <section className="hero hero--referrals">
          <div className="hero__container">
            <div className="hero__content" data-reveal>
              <div className="hero__badge">Coming Soon</div>
              <h1 className="hero__title">
                Fast, high-quality hires from the people who know your business best
              </h1>
              <p className="hero__subtitle">
                Turn employees into your #1 source of high-quality hires. Aureli Referrals taps into
                the power of your existing workforce by automating referral campaigns to fill open
                roles faster with trusted candidates who stay longer.
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

        {/* Why Referrals Section */}
        <section className="section section--why-referrals">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why Aureli Referrals?</h2>
              <p className="section__subtitle">
                Aureli Referrals taps into the power of your existing workforce by automating referral
                campaigns to fill open roles faster with trusted candidates who stay longer.
              </p>
            </div>
            <div className="why-referrals-grid">
              {whyReferrals.map(({ title, description }) => (
                <article className="why-referral-card" data-reveal key={title}>
                  <h3 className="why-referral-card__title">{title}</h3>
                  <p className="why-referral-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Built-In Referrals Section */}
        <section className="section section--built-in">
          <div className="section__container">
            <div className="built-in-content" data-reveal>
              <h2 className="section__title">Built-In Referrals That Actually Deliver</h2>
              <p className="section__subtitle">
                Aureli Referrals tracks every referral, targets the right roles, and keeps employees
                engaged. Launch campaigns that scale, and fill roles faster with people your team
                already trusts.
              </p>
              <a href="#features" className="built-in-link">
                Learn More →
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section section--benefits-referrals">
          <div className="section__container">
            <div className="benefits-referrals-content" data-reveal>
              <h2 className="section__title">
                Referred workers stay longer, show up faster
              </h2>
              <p className="section__subtitle">
                Referrals isn't just another hiring channel. It's the one that works. Aureli Referrals
                turns your employees into your best recruiters with fast, simple tools that make it easy
                to send and track referrals from any device. You'll spend less on sourcing and fill
                roles with candidates who are already a cultural fit.
              </p>
              <a href="#how-it-works" className="benefits-referrals-link">
                See it in action →
              </a>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="section section--capabilities" id="features">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">What you can do with Aureli Referrals</h2>
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
        <section className="section section--features-referrals">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Built for high-volume, hourly referrals</h2>
            </div>
            <div className="features-referrals-grid">
              {features.map(({ title, description }) => (
                <article className="feature-referral-card" data-reveal key={title}>
                  <h3 className="feature-referral-card__title">{title}</h3>
                  <p className="feature-referral-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - Adapted for startup */}
        <section className="section section--stats-referrals">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">
                More hires, higher retention—driven by your team
              </h2>
              <p className="section__subtitle">
                Referral programs typically deliver better results than traditional hiring channels.
              </p>
            </div>
            <div className="stats-referrals-grid">
              <div className="stat-referral-item" data-reveal>
                <div className="stat-referral-item__value">25%</div>
                <div className="stat-referral-item__label">reduction in time-to-hire</div>
              </div>
              <div className="stat-referral-item" data-reveal>
                <div className="stat-referral-item__value">40%</div>
                <div className="stat-referral-item__label">increase in applicant quality</div>
              </div>
              <div className="stat-referral-item" data-reveal>
                <div className="stat-referral-item__value">2x</div>
                <div className="stat-referral-item__label">improvement in retention after 90 days</div>
              </div>
            </div>
            <div className="stats-note" data-reveal>
              <p className="stats-note__text">
                *Industry benchmarks for referral programs. Results may vary.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section section--use-cases">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">
                Where Aureli Referrals drive better, faster hires
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
        <section className="section section--how-referrals" id="how-it-works">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">How it works</h2>
              <p className="section__subtitle">
                With Aureli Referrals, employees can instantly share open roles with their networks via
                text, QR code, or a mobile-friendly page. Aureli Referrals tracks every step, from
                referral sent to hired, and keeps your team informed. No spreadsheets, no follow-ups.
                Just results.
              </p>
            </div>
            <div className="how-referrals-grid">
              {howItWorks.map(({ step, title, description }) => (
                <article className="how-referral-card" data-reveal key={step}>
                  <div className="how-referral-card__step">{step}</div>
                  <h3 className="how-referral-card__title">{title}</h3>
                  <p className="how-referral-card__description">{description}</p>
                </article>
              ))}
            </div>
            <div className="how-referrals-cta" data-reveal>
              <a href="#contact" className="how-referrals-link">
                Book a demo →
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section section--cta" id="contact">
          <div className="section__container">
            <div className="cta-content-wrapper" data-reveal>
              <h2 className="cta__title">Launch your referral program today</h2>
              <p className="cta__subtitle">
                Get early access to Aureli Referrals and start turning your employees into your best
                recruiters.
              </p>
            </div>
            <div className="cta-form-wrapper" data-reveal>
              <div className="scheduler-intro">
                <h3 className="scheduler-intro__title">Schedule a Demo</h3>
                <p className="scheduler-intro__description">
                  Book a personalized demo with our team. We'll show you how Aureli Referrals can
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

