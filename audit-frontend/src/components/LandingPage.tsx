import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const COMPANY_NAME = 'CybriX Solutions';
const FEATURES = [
  {
    icon: '🛡️',
    title: 'Gestion centralisée',
    desc: 'Pilotez tous vos audits, constats et plans d\'action depuis une seule plateforme intuitive.',
    stats: 'Équipe interne'
  },
  {
    icon: '✅',
    title: 'Conformité et sécurité',
    desc: 'Assurez la conformité de votre SI grâce au suivi intelligent des actions et recommandations.',
    stats: 'Accès sécurisé'
  },
  {
    icon: '📊',
    title: 'Analyse & Reporting',
    desc: 'Obtenez une vision globale de votre conformité et de vos progrès en temps réel.',
    stats: 'Données internes'
  },
];

const STATS = [
  { number: '100%', label: 'Accès interne' },
  { number: '50+', label: 'Audits réalisés' },
  { number: '99.9%', label: 'Taux de conformité' },
  { number: '24/7', label: 'Support interne' }
];

const NavigationMenu = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="hidden md:flex items-center space-x-8 text-slate-300 font-medium">
      <button 
        onClick={() => scrollToSection('fonctionnalites')} 
        className="hover:text-emerald-400 transition-colors cursor-pointer"
      >
        Fonctionnalités
      </button>
      <button 
        onClick={() => scrollToSection('stats-section')} 
        className="hover:text-emerald-400 transition-colors cursor-pointer"
      >
        Statistiques
      </button>
      <button 
        onClick={() => scrollToSection('contact')} 
        className="hover:text-emerald-400 transition-colors cursor-pointer"
      >
        Contact
      </button>
    </nav>
  );
};

const AnimatedCounter: React.FC<{ end: string; duration?: number }> = ({ end, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(end);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Handle different number formats
    if (end.includes('%')) {
      const numericValue = parseFloat(end.replace('%', ''));
      const increment = numericValue / 50;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current) + '%');
        }
      }, duration / 50);

      return () => clearInterval(timer);
    } else if (end.includes('+')) {
      const numericValue = parseInt(end.replace('+', ''));
      const increment = numericValue / 50;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current) + '+');
        }
      }, duration / 50);

      return () => clearInterval(timer);
    } else if (end.includes('/')) {
      // For 24/7, just show it immediately
      setDisplayValue(end);
    } else {
      // For other formats, show immediately
      setDisplayValue(end);
    }
  }, [isVisible, end, duration]);

  return <span>{displayValue}</span>;
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-slate-700 bg-slate-800/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2 select-none">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-extrabold text-xl shadow-lg float-animation">CS</span>
              <span className="font-bold text-lg md:text-xl text-white tracking-tight ml-2">{COMPANY_NAME}</span>
            </div>
            <div className="flex items-center gap-2">
              <NavigationMenu />
              <button
                onClick={() => navigate('/login')}
                className="ml-6 btn-primary text-base px-6 py-2"
              >
                Connexion
              </button>
            </div>
          </div>
        </div>
        
        {/* Header info bar */}
        <div className="bg-slate-900/50 border-t border-slate-700 py-2">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Plateforme interne</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Accès sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Données protégées</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Accès 24/7</span>
                </div>
                <div className="text-emerald-400 font-semibold">
                  Version 2.1.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full px-4 md:px-0 mx-auto max-w-7xl py-16 md:py-24 flex flex-col md:flex-row items-center justify-center md:justify-between gap-12 md:gap-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Left: Headline and Call-to-action */}
        <section className={`w-full md:w-1/2 md:pl-16 md:pr-8 flex flex-col justify-center items-center md:items-start text-center md:text-left transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-white font-extrabold text-4xl md:text-6xl mb-6 leading-tight">
            {COMPANY_NAME}<br/>
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Sécurisez & Pilotez votre SI
            </span>
          </h1>
          <div className="text-slate-300 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
            <p className="mb-4">
              <span className="text-white font-semibold">Plateforme interne</span> pour les audits de sécurité, la conformité et la gestion intelligente des plans d'action.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold text-base">Accès réservé aux employés</span>
              <span className="text-slate-400">de l'entreprise</span>
            </div>
          </div>

        </section>
        {/* Right: Animated Illustration */}
        <section className="hidden md:flex flex-col w-1/2 items-center justify-center">
          <div className="relative w-96 h-80 flex items-center justify-center">
            <div className="absolute left-0 top-0 w-96 h-80 bg-gradient-to-br from-emerald-600/20 to-purple-600/20 rounded-[2.5rem] -z-10 float-animation"></div>
            <div className="w-56 h-56 bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-emerald-500/30 rounded-3xl flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-500">
              <span className="text-7xl text-emerald-400 font-extrabold mb-3 float-animation">CS</span>
              <span className="mt-2 text-slate-400 font-mono text-lg">Votre SSI</span>
              <div className="mt-4 flex space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Stats Section */}
      <section id="stats-section" className="w-full bg-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nos Performances</h2>
            <p className="text-slate-400 text-lg">Des résultats qui témoignent de notre expertise et de notre engagement</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="stats-card text-center group">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2 group-hover:text-emerald-300 transition-colors">
                  <AnimatedCounter end={stat.number} />
                </div>
                <div className="text-slate-300 text-sm md:text-base group-hover:text-white transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature blocks */}
      <section id="fonctionnalites" className="w-full max-w-6xl mx-auto pt-16 pb-20 px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Fonctionnalités principales</h2>
          <p className="text-slate-400 text-lg">Outils professionnels pour votre équipe interne</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f, idx) => (
            <div
              key={f.title}
              className="feature-card group"
              style={{animationDelay: `${idx * 0.2}s`}}
            >
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600/20 text-4xl group-hover:bg-emerald-600/30 transition-all duration-300">{f.icon}</div>
              <div className="font-bold text-xl text-white mb-3 group-hover:text-emerald-400 transition-colors">{f.title}</div>
              <div className="text-slate-400 leading-6 mb-4">{f.desc}</div>
              <div className="text-emerald-400 font-semibold text-sm">{f.stats}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Accédez à votre espace de travail
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Connectez-vous avec vos identifiants d'entreprise pour accéder à la plateforme d'audit interne.
          </p>
          <button
            className="bg-slate-800 text-emerald-600 font-bold text-lg px-8 py-3 rounded-lg hover:bg-slate-800 transform hover:scale-105 transition-all duration-300 shadow-lg"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full bg-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact & Support</h2>
            <p className="text-slate-400 text-lg">Besoin d'aide ? Notre équipe est là pour vous accompagner</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
              <p className="text-slate-400 mb-4">support@cybrix-solutions.com</p>
              <button 
                onClick={() => window.open('mailto:support@cybrix-solutions.com', '_blank')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Envoyer un email
              </button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Téléphone</h3>
              <p className="text-slate-400 mb-4">+33 1 23 45 67 89</p>
              <button 
                onClick={() => window.open('tel:+33123456789', '_blank')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Appeler maintenant
              </button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Horaires</h3>
              <p className="text-slate-400 mb-4">Lun-Ven 9h-18h</p>
              <button 
                onClick={() => {
                  alert('Support disponible du lundi au vendredi de 9h à 18h');
                }}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Voir les horaires
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-700 bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-extrabold text-sm shadow-lg">CS</span>
                <span className="font-bold text-lg text-white">{COMPANY_NAME}</span>
              </div>
              <p className="text-slate-400 text-sm mb-4 max-w-md">
                Plateforme interne de gestion des audits de sécurité et de conformité. 
                Outils professionnels pour votre équipe IT.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Environnement sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Support technique</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Accès rapide</h3>
              <nav className="space-y-2">
                <button 
                  onClick={() => {
                    const element = document.getElementById('fonctionnalites');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm cursor-pointer text-left"
                >
                  Fonctionnalités
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('stats-section');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm cursor-pointer text-left"
                >
                  Statistiques
                </button>
                <button 
                  onClick={() => navigate('/login')} 
                  className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm cursor-pointer text-left"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('contact');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="block text-slate-400 hover:text-emerald-400 transition-colors text-sm cursor-pointer text-left"
                >
                  Support
                </button>
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@cybrix-solutions.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Lun-Ven 9h-18h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-6">
              <div>© {new Date().getFullYear()} {COMPANY_NAME} – Tous droits réservés.</div>
              <div className="hidden md:flex items-center gap-4">
                <button 
                  onClick={() => {
                    // Simulate opening terms modal or page
                    alert('Mentions légales - Page en cours de développement');
                  }} 
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Mentions légales
                </button>
                <button 
                  onClick={() => {
                    // Simulate opening privacy policy
                    alert('Politique de confidentialité - Page en cours de développement');
                  }} 
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Confidentialité
                </button>
                <button 
                  onClick={() => {
                    // Simulate opening cookies policy
                    alert('Politique des cookies - Page en cours de développement');
                  }} 
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Cookies
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-emerald-400 font-semibold text-xs">
                v2.1.0 • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
