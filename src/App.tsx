import { useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";
import "./styles/App.css";
import Header from "./components/Header";
import Hire from "./pages/Hire";
import Referrals from "./pages/Referrals";
import I9Center from "./pages/I9Center";
import Onboard from "./pages/Onboard";
import Compliance from "./pages/Compliance";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import BusinessOwnerDashboard from "./pages/BusinessOwnerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const products = [
  {
    title: "Predictive Hiring",
    description: "Know when and how many people you need to hire—weeks in advance",
    category: "Core",
  },
  {
    title: "Hiring Analytics",
    description: "Real-time insights into your hiring patterns and workforce needs",
    category: "Core",
  },
  {
    title: "Workforce Planning",
    description: "Forecast staffing needs based on business metrics and trends",
    category: "Core",
  },
  {
    title: "Smart Alerts",
    description: "Automated notifications when hiring needs are approaching",
    category: "Automation",
  },
  {
    title: "Timing Optimization",
    description: "AI recommends the optimal time to start recruiting for each role",
    category: "Automation",
  },
  {
    title: "Volume Forecasting",
    description: "Predict exactly how many candidates you'll need to source",
    category: "Automation",
  },
  {
    title: "Integration Hub",
    description: "Connect with your HRIS, ATS, and scheduling systems",
    category: "Platform",
  },
  {
    title: "Custom Models",
    description: "Build forecasting models tailored to your business needs",
    category: "Platform",
  },
  {
    title: "Referrals",
    description: "Turn employees into your #1 source of high-quality hires with automated referral campaigns",
    category: "Core",
  },
  {
    title: "I-9 Center",
    description: "Fast, compliant I-9s without the friction. Complete I-9s in minutes with audit-ready workflows",
    category: "Compliance",
  },
  {
    title: "Onboard",
    description: "Get new hires to day one 2x faster with fewer errors. Mobile-first onboarding for hourly workers",
    category: "Talent Management",
  },
  {
    title: "Compliance",
    description: "Stay compliant without slowing hiring. Automated document checks and guardrails for high-volume teams",
    category: "Compliance",
  },
];


const benefits = [
  "Predict hiring needs weeks before shortages occur",
  "Optimize hiring timing to reduce costs and improve retention",
  "Never over-hire or under-hire with precise forecasting",
  "Automated alerts keep you ahead of demand",
  "Integrates seamlessly with your existing HR tech stack",
  "Custom models adapt to your unique business patterns",
];

const testimonials = [
  {
    quote:
      "Aureli tells us exactly when we need to start hiring and how many people we'll need. We've eliminated rush hiring and reduced our hiring costs by 30%.",
    author: "Nick Prijic",
    role: "Director of Operations",
    company: "Fetch",
    metric: "30%",
    metricLabel: "reduction in hiring costs",
  },
  {
    quote:
      "The predictive hiring intelligence is game-changing. We know weeks in advance when we'll need to ramp up hiring, and we're always fully staffed.",
    author: "Rachel Carey",
    role: "Program Manager",
    company: "Stitch Fix",
    metric: "4-8 weeks",
    metricLabel: "advance notice",
  },
];

const industries = [
  "Retail",
  "Hospitality",
  "Healthcare",
  "Logistics",
  "Manufacturing",
  "Food Service",
];

const faqs = [
  {
    question: "What is predictive hiring?",
    answer:
      "Predictive hiring uses AI to analyze your business data and predict when and how many people you'll need to hire—weeks before you need them. This helps you avoid rush hiring, reduce costs, and stay fully staffed.",
  },
  {
    question: "What features does Aureli offer?",
    answer:
      "Aureli offers predictive hiring, hiring analytics, workforce planning, smart alerts, timing optimization, volume forecasting, integration capabilities, and custom forecasting models. See our features section above or learn more about the hiring process on our Hire page.",
  },
  {
    question: "How do I get started?",
    answer:
      "Schedule a demo with our team to see how Aureli can transform your hiring decisions. We'll show you how the platform works and help you get set up with early access.",
  },
];


function HomePage() {
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
        <section className="hero hero--main">
          <div className="hero__container">
            <div className="hero__content" data-reveal>
              <h1 className="hero__title">
                The first AI-Powered
                <br />
                Predictive Hiring Platform
              </h1>
              <p className="hero__subtitle">
                Aureli's AI predicts when and how many people you need to hire—weeks before you
                need them. Built for hiring timing decisions, workforce planning, and more.
              </p>
              <div className="hero__actions">
                <a className="hero__primary" href="#contact">
                  Get Started
                </a>
              </div>
              <div className="hero__products">
                {products.slice(0, 6).map((product) => (
                  <span key={product.title} className="hero__product-tag">
                    {product.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="section section--stats-bar">
          <div className="section__container">
            <p className="stats-bar__text" data-reveal>
              We've helped companies optimize hiring timing for millions of workers
            </p>
          </div>
        </section>

        {/* AI Section */}
        <section className="section section--ai">
          <div className="section__container">
            <div className="ai-content">
              <div className="ai-text" data-reveal>
                <h2 className="section__title">
                  Predictive AI that makes smarter hiring decisions
                </h2>
                <p className="section__subtitle">
                  Hiring timing is a race against demand. Shortages happen. Rush hiring costs
                  money. Over-hiring wastes resources.
                </p>
                <p className="section__subtitle">
                  <strong>Aureli is built on intelligent predictions that:</strong>
                </p>
                <ul className="ai-features">
                  <li>Analyze historical patterns, turnover, and business metrics</li>
                  <li>Share insights across your organization to make smarter decisions</li>
                  <li>Automatically alert you when hiring needs are approaching</li>
                </ul>
                <a href="#features" className="ai-link">
                  Learn more about Predictive AI at Aureli →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* One Platform Section */}
        <section className="section section--platform">
          <div className="section__container">
            <div className="platform-content" data-reveal>
              <h2 className="section__title">
                One platform.
                <br />
                Every hiring timing decision.
              </h2>
              <p className="section__subtitle">
                Aureli unifies predictive hiring, workforce planning, and timing optimization in one
                seamless platform—powered by intelligent AI and designed to plug into your existing
                stack.
              </p>
              <a href="#features" className="platform-link">
                Learn more →
              </a>
            </div>
          </div>
        </section>

        {/* Hiring Process Section */}
        <section className="section section--hiring-process" id="solutions">
          <div className="section__container">
            <div className="hiring-process-content" data-reveal>
              <h2 className="section__title">How predictive hiring works</h2>
              <p className="section__subtitle">
                Aureli analyzes your data to predict when and how many people you'll need to hire,
                then provides actionable recommendations to optimize your hiring timing.
              </p>
              <Link to="/hire" className="hiring-process-link">
                Learn more about the hiring process →
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section section--features" id="features">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Smarter hiring timing with AI</h2>
              <p className="section__subtitle">
                Meet our AI-powered features, built to solve real hiring timing challenges—faster.
                Whether you're predicting seasonal needs or managing growth, these solutions
                deliver action—not just insight.
              </p>
            </div>
            <div className="features-grid">
              {products.map(({ title, description, category }) => (
                <article className="feature-card" data-reveal key={title}>
                  <div className="feature-card__category">{category}</div>
                  <h3 className="feature-card__title">{title}</h3>
                  <p className="feature-card__description">{description}</p>
                  {title === "Predictive Hiring" && (
                    <Link to="/hire" className="feature-card__link">
                      Learn more →
                    </Link>
                  )}
                  {title === "Referrals" && (
                    <Link to="/referrals" className="feature-card__link">
                      Learn more →
                    </Link>
                  )}
                  {title === "I-9 Center" && (
                    <Link to="/i9-center" className="feature-card__link">
                      Learn more →
                    </Link>
                  )}
                  {title === "Onboard" && (
                    <Link to="/onboard" className="feature-card__link">
                      Learn more →
                    </Link>
                  )}
                  {title === "Compliance" && (
                    <Link to="/compliance" className="feature-card__link">
                      Learn more →
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section section--benefits">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Hire at the speed of demand</h2>
              <p className="section__subtitle">
                Most workforce planning tools aren't built to predict hiring timing accurately.
                Ours was designed from the ground up to help your team make smarter hiring
                decisions:
              </p>
            </div>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div className="benefit-item" data-reveal key={index}>
                  <div className="benefit-item__check">✓</div>
                  <p className="benefit-item__text">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="benefits-cta" data-reveal>
              <a href="#contact" className="benefits-link">
                Start optimizing hiring timing →
              </a>
            </div>
          </div>
        </section>

        {/* Partner Section */}
        <section className="section section--partner">
          <div className="section__container">
            <div className="partner-content" data-reveal>
              <h2 className="section__title">
                More than software.
                <br />
                A partner too.
              </h2>
              <p className="section__subtitle">
                We partner with customers to develop new features and capabilities—launching
                regularly! Your needs guide us, and our experience guides you. Want in? Join our
                early access program!
              </p>
              <div className="partner-features">
                <div className="partner-feature">
                  <h3 className="partner-feature__title">Tailored features</h3>
                  <p className="partner-feature__description">
                    Our design, product, and engineering teams customize functions to your input.
                  </p>
                </div>
                <div className="partner-feature">
                  <h3 className="partner-feature__title">Early access</h3>
                  <p className="partner-feature__description">
                    Get advanced access to our latest features and products.
                  </p>
                </div>
                <div className="partner-feature">
                  <h3 className="partner-feature__title">Free beta use</h3>
                  <p className="partner-feature__description">
                    Enjoy new products completely free while they're in the beta stage.
                  </p>
                </div>
                <div className="partner-feature">
                  <h3 className="partner-feature__title">Discounted pricing</h3>
                  <p className="partner-feature__description">
                    Access preferential pricing once products exit beta.
                  </p>
                </div>
              </div>
              <div className="partner-cta" data-reveal>
                <a href="#contact" className="partner-link">
                  Join Now →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="section section--experience">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">
                Take hiring timing decisions to new heights
              </h2>
              <p className="section__subtitle">
                From workforce planning to execution. Aureli elevates hiring timing, workforce
                planning, and retention at scale.
              </p>
            </div>
            <div className="experience-grid">
              <article className="experience-card" data-reveal>
                <h3 className="experience-card__title">Predictive Hiring</h3>
                <p className="experience-card__description">
                  Know when and how many people you need to hire—weeks in advance. AI analyzes your
                  data to provide accurate forecasts.
                </p>
              </article>
              <article className="experience-card" data-reveal>
                <h3 className="experience-card__title">Workforce Planning</h3>
                <p className="experience-card__description">
                  Forecast staffing needs based on business metrics, seasonal trends, and turnover
                  patterns.
                </p>
              </article>
              <article className="experience-card" data-reveal>
                <h3 className="experience-card__title">Timing Optimization</h3>
                <p className="experience-card__description">
                  AI recommends the optimal time to start recruiting for each role, reducing costs
                  and improving retention.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section section--testimonials">
          <div className="section__container">
            <div className="testimonials-carousel">
              {testimonials.map(({ quote, author, role, company, metric, metricLabel }) => (
                <article className="testimonial-large" data-reveal key={author}>
                  <div className="testimonial-large__content">
                    <blockquote className="testimonial-large__quote">"{quote}"</blockquote>
                    <div className="testimonial-large__author">
                      <div className="testimonial-large__avatar"></div>
                      <div>
                        <div className="testimonial-large__name">{author}</div>
                        <div className="testimonial-large__role">
                          {role}, {company}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="testimonial-large__metric">
                    <div className="testimonial-large__metric-value">{metric}</div>
                    <div className="testimonial-large__metric-label">{metricLabel}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="section section--industries">
          <div className="section__container">
            <div className="section__header" data-reveal>
              <h2 className="section__title">Purpose-built for...</h2>
            </div>
            <div className="industries-grid">
              {industries.map((industry) => (
                <div className="industry-tag" data-reveal key={industry}>
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section section--cta" id="contact">
          <div className="section__container">
            <div className="cta-content-wrapper" data-reveal>
              <h2 className="cta__title">Ready to optimize your hiring timing?</h2>
              <p className="cta__subtitle">Get started today and see how Aureli can transform your hiring decisions.</p>
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
            <div className="faq-cta" data-reveal>
              <p className="faq-cta__text">
                Have questions about the hiring process?{" "}
                <Link to="/hire" className="faq-cta__link">
                  Visit our Hire page for detailed FAQs →
                </Link>
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
              <a href="#features">Features</a>
              <a href="#solutions">Solutions</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer__column">
              <h4 className="footer__heading">Company</h4>
              <a href="#company">About</a>
              <a href="#contact">Contact</a>
              <a href="#resources">Resources</a>
            </div>
            <div className="footer__column">
              <h4 className="footer__heading">Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
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

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/hire" element={<Hire />} />
      <Route path="/referrals" element={<Referrals />} />
      <Route path="/i9-center" element={<I9Center />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/compliance" element={<Compliance />} />
      
      {/* Authentication routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated && user ? (
            <Navigate to={`/${user.role === 'admin' ? 'admin' : user.role === 'business_owner' ? 'business-owner' : 'employee'}`} replace />
          ) : (
            <Login />
          )
        } 
      />
      
      {/* Protected role-based routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-owner"
        element={
          <ProtectedRoute allowedRoles={['business_owner']}>
            <BusinessOwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
