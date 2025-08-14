import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  
  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="logo-section">
              <img src="/images/LOGO.jpg" alt="JobHatch Logo" className="hero-logo" />
              <h1 className="brand-name">JobHatch</h1>
            </div>
            <p className="enterprise-tag">Enterprise AI</p>
            <h2 className="hero-title">
              Find Your <span className="title-highlight">Perfect Candidate</span> in Minutes
            </h2>
            <p className="hero-description">
              🚀 AI-powered resume screening that analyzes candidates across{' '}
              <span className="highlight-text">LinkedIn</span>, GitHub, and{' '}
              <span className="highlight-text">personal portfolios</span>{' '}
              to find the perfect match for your role.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="feature-title">Smart Matching</h3>
            <p className="feature-description">AI analyzes technical skills, experience, and cultural fit</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="feature-title">Real-time Analysis</h3>
            <p className="feature-description">Watch as our AI researches each candidate across the web</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="feature-title">Comprehensive Reports</h3>
            <p className="feature-description">Get detailed insights and rankings for informed decisions</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <button
            onClick={() => user ? navigate('/resumes/new') : navigate('/login')}
            className="cta-button"
          >
            🚀 Get Started Now <span className="cta-arrow">→</span>
          </button>
        </div>



        {/* Footer */}
        <div className="footer-section">
          <p className="footer-text"></p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
