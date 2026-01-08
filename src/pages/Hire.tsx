import { Link } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useMemo } from "react";
import "../styles/App.css";
import Header from "../components/Header";

const howItWorks = [
  {
    step: "1",
    title: "Connect your data",
    description:
      "Integrate with your HRIS, scheduling systems, and business metrics. Aureli analyzes historical patterns, turnover rates, and seasonal trends.",
  },
  {
    step: "2",
    title: "Get predictive insights",
    description:
      "AI tells you exactly when you'll need to hire and how many candidates to source. Get alerts weeks before hiring needs arise.",
  },
  {
    step: "3",
    title: "Execute with confidence",
    description:
      "Start recruiting at the optimal time with the right number of candidates. Never over-hire or under-hire again.",
  },
];

const faqs = [
  {
    question: "How accurate are the hiring timing predictions?",
    answer:
      "Our AI analyzes historical data, seasonal patterns, turnover rates, and business metrics to provide accurate forecasts. Most customers see 85-95% accuracy in predicting when and how many people they'll need to hire.",
  },
  {
    question: "What data do I need to provide?",
    answer:
      "Aureli integrates with your existing HRIS, scheduling systems, and business tools. We analyze historical hiring data, turnover rates, seasonal patterns, and business forecasts. The more data you connect, the more accurate the predictions.",
  },
  {
    question: "How far in advance can Aureli predict hiring needs?",
    answer:
      "Aureli can predict hiring needs weeks to months in advance, depending on your business patterns. Most customers get 4-8 week advance notice, giving them plenty of time to start recruiting proactively.",
  },
];

export default function Hire() {
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
        <section className="hero">
          <div className="hero__container">
            <div className="hero__content" data-reveal>
              <div className="hero__badge">Coming Soon</div>
              <h1 className="hero__title">
                Know when and how many people you need to hire
              </h1>
              <p className="hero__subtitle">
                Aureli uses AI to analyze your business data and tell you exactly when to start
                hiring and how many candidates to source—weeks before you need them. Never over-hire
                or under-hire again.
              </p>
              <div className="hero__actions">
                <a className="hero__primary" href="#contact">
                  Get Early Access
                </a>
                <a className="hero__secondary" href="#how-it-works">
                  Learn More
                </a>
              </div>
            </div>
            <div className="hero__visual" data-reveal>
              <div className="hero__dashboard">
                <div className="dashboard__header">
                  <div className="dashboard__nav">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="dashboard__title">Hiring Forecast</div>
                </div>
                <div className="dashboard__content">
                  <div className="forecast-alert">
                    <div className="forecast-alert__icon">⚠️</div>
                    <div className="forecast-alert__content">
                      <div className="forecast-alert__title">Hiring Need Detected</div>
                      <div className="forecast-alert__text">
                        Start hiring in 3 weeks • Need 8 cashiers
                      </div>
                    </div>
                  </div>
                  <div className="forecast-chart">
                    <div className="chart-header">
                      <div className="chart-title">Next 8 Weeks</div>
                      <div className="chart-legend">
                        <span className="legend-item">
                          <span className="legend-color" style={{ background: "#dbeafe" }}></span>
                          Current Staff
                        </span>
                        <span className="legend-item">
                          <span className="legend-color" style={{ background: "#fef3c7" }}></span>
                          Needed Staff
                        </span>
                      </div>
                    </div>
                    <div className="chart-bars">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                        <div key={week} className="chart-bar">
                          <div className="bar-group">
                            <div className="bar bar--current" style={{ height: "60%" }}></div>
                            <div
                              className="bar bar--needed"
                              style={{
                                height: week > 3 ? "85%" : "60%",
                              }}
                            ></div>
                          </div>
                          <div className="bar-label">W{week}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="recommendations">
                    <div className="recommendation-item">
                      <div className="recommendation-icon">📅</div>
                      <div>
                        <div className="recommendation-title">Start Recruiting</div>
                        <div className="recommendation-date">March 15, 2025</div>
                      </div>
                    </div>
                    <div className="recommendation-item">
                      <div className="recommendation-icon">👥</div>
                      <div>
                        <div className="recommendation-title">Target Candidates</div>
                        <div className="recommendation-date">12 candidates</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section - Simplified */}
        <section className="section section--why">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Why Aureli?</h2>
              <p className="section__subtitle">
                Stop guessing when to hire. Aureli analyzes your business data and tells you exactly
                when and how many people you need—weeks before you need them.
              </p>
            </div>
            <div className="why-grid">
              <article className="why-card" data-reveal>
                <h3 className="why-card__title">Predict hiring needs before shortages</h3>
                <p className="why-card__description">
                  AI analyzes historical data, seasonal patterns, and business metrics to tell you
                  exactly when and how many people you need to hire—weeks before you need them.
                </p>
              </article>
              <article className="why-card" data-reveal>
                <h3 className="why-card__title">Optimize hiring timing decisions</h3>
                <p className="why-card__description">
                  Never over-hire or under-hire again. Get precise recommendations on when to start
                  recruiting, how many candidates to source, and when to schedule interviews.
                </p>
              </article>
              <article className="why-card" data-reveal>
                <h3 className="why-card__title">Reduce costs with smart planning</h3>
                <p className="why-card__description">
                  Avoid rush hiring premiums and reduce turnover by hiring at the right time with
                  the right number of candidates for your business needs.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section section--how" id="how-it-works">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">How it works</h2>
              <p className="section__subtitle">
                Three simple steps to start making smarter hiring timing decisions.
              </p>
            </div>
            <div className="how-grid">
              {howItWorks.map(({ step, title, description }) => (
                <article className="how-card" data-reveal key={step}>
                  <div className="how-card__step">{step}</div>
                  <h3 className="how-card__title">{title}</h3>
                  <p className="how-card__description">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section section--cta" id="contact">
          <div className="section__container">
            <div className="cta-content-wrapper" data-reveal>
              <h2 className="cta__title">Get early access</h2>
              <p className="cta__subtitle">
                Be among the first to experience predictive hiring intelligence. Join our waitlist to
                get notified when we launch.
              </p>
            </div>
            <div className="cta-form-wrapper" data-reveal>
              <div className="scheduler-intro">
                <h3 className="scheduler-intro__title">Schedule a Demo</h3>
                <p className="scheduler-intro__description">
                  Book a personalized demo with our team. We'll show you how Aureli can predict
                  your hiring needs and optimize your timing decisions.
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

        {/* About Section */}
        <section className="section section--about" id="about">
          <div className="section__container">
            <div className="about-content" data-reveal>
              <h2 className="section__title">About Aureli</h2>
              <p className="section__subtitle">
                We're building the future of predictive hiring. Aureli helps companies make smarter
                hiring timing decisions by analyzing business data and providing actionable
                insights on when and how many people to hire.
              </p>
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
              <a href="#how-it-works">How It Works</a>
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

