import { useState } from 'react';
import { Github, Linkedin, Mail, Code, Briefcase, User, MessageCircle, X, ArrowRight } from 'lucide-react';

export default function PortfolioApp() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userName, setUserName] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const skills = [
    { name: 'Docker', level: 90 },
    { name: 'React', level: 85 },
    { name: 'Node.js', level: 80 },
    { name: 'DevOps', level: 75 },
    { name: 'Kubernetes', level: 70 },
    { name: 'Linux', level: 85 },
    { name: 'AWS', level: 85 },
    { name: 'Git', level: 85 },
    { name: 'Scripting', level: 80 }
  ];

  const projects = [
    {
      title: 'Docker Optimization and Best Practices',
      description: 'A containerized React application showcasing Docker, setup, best practices including multi-stage builds and security.',
      tech: ['React', 'Docker', 'Nginx'],
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Secure CI/CD Pipeline with AWS',
      description: 'Automated CI/CD pipeline with GitHub Actions, Docker, and automated testing and deployment.',
      tech: ['GitHub Actions', 'Docker', 'AWS', 'OIDC'],
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Microservices Architecture with EKS',
      description: 'Scalable microservices application with container orchestration and service discovery.',
      tech: ['Kubernetes', 'Docker', 'MongoDB'],
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Secure S3 Architecture on AWS',
      description: 'A multi-layer S3 security implementation covering encryption, access points, object lock, presigned access, and auditing.',
      tech: ['AWS S3', 'CloudTrail', 'AWS KMS', 'Terraform'],
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'EKS Access Control with AWS Identity Center',
      description: 'A production-ready EKS setup using AWS Identity Center, EKS Access Entries, and Kubernetes RBAC for least-privilege access.',
      tech: ['AWS Identity Center', 'Kubernetes RBAC', 'Terraform'],
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'MLOps with MLflow',
      description: 'An ML project integrated with MLflow for experiment tracking, model versioning, and reproducible training workflows.',
      tech: ['MLFlow', 'Python', 'MLOps'],
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const socials = [
    { name: 'GitHub', icon: Github, url: 'github.com/yourname', color: 'hover:bg-gray-800' },
    { name: 'LinkedIn', icon: Linkedin, url: 'linkedin.com/in/yourname', color: 'hover:bg-blue-600' },
    { name: 'Email', icon: Mail, url: 'your.email@example.com', color: 'hover:bg-red-500' }
  ];

  const handleWelcomeSubmit = () => {
    if (userName.trim()) {
      setVisitorName(userName);
      setTimeout(() => setShowWelcome(false), 1500);
    }
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setShowContact(false);
        setSubmitted(false);
        setFormData({ name: '', email: '', message: '' });
      }, 2000);
    }
  };

  // Welcome Screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {!visitorName ? (
            <div className="text-center animate-fade-in">
              <div className="mb-8">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 text-transparent bg-clip-text">
                  Hi! 👋
                </h1>
                <p className="text-xl text-green-200">Welcome to my portfolio</p>
              </div>
              
              <div className="bg-green-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                <label className="block text-lg font-semibold mb-4 text-green-100">
                  What's your name?
                </label>
                <input
                  type="text"
                  className="w-full bg-green-700 bg-opacity-50 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-400 mb-6"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleWelcomeSubmit()}
                  placeholder="Enter your name"
                  autoFocus
                />
                <button
                  onClick={handleWelcomeSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fade-in">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 text-transparent bg-clip-text">
                Welcome, {visitorName}! 🎉
              </h2>
              <p className="text-xl text-green-200">Let me show you what I've been working on...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Portfolio
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Queen Elizabeth
          </h1>
          <p className="text-xl text-gray-300 mb-2">DevOps Engineer & Cloud Engineer</p>
          <p className="text-green-400 mb-8">Nice to meet you, {visitorName}!</p>
          <button
            onClick={() => setShowContact(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            <MessageCircle className="w-5 h-5" />
            Get In Touch
          </button>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Code className="w-6 h-6 text-green-400" />
            <h2 className="text-3xl font-bold">Skills & Technologies</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-green-400">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold">Featured Projects</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all">
                <div className={`h-2 bg-gradient-to-r ${project.color}`}></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="bg-gray-700 px-3 py-1 rounded-full text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6">Connect With Me</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            {socials.map((social, index) => {
              const Icon = social.icon;
              return (
                <button
                  key={index}
                  className={`bg-gray-800 p-4 rounded-lg ${social.color} transition-all hover:scale-110 flex items-center gap-3 min-w-[200px]`}
                  onClick={() => alert(`Visit: ${social.url}`)}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">{social.name}</div>
                    <div className="text-sm font-semibold">{social.url}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6">Let's Connect, {visitorName}!</h3>
            
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl font-semibold text-green-400">Message Sent!</p>
                <p className="text-gray-400 mt-2">I'll get back to you soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
