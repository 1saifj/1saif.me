import React from 'react'
import { Download, MapPin, Phone, Mail, Github, Linkedin, Calendar, Award, GraduationCap, Briefcase, ExternalLink, BookOpen } from 'lucide-react'
import { CareerTimeline } from './CareerTimeline'

export const Resume: React.FC = () => {
  const handleDownloadResume = () => {
    const link = document.createElement('a')
    link.href = '/cv.html'
    link.target = '_blank'
    link.click()
  }

  const experience = [
    {
      title: "Assistant Engineer - Software Development & Graduate Services",
      company: "University of Kufa",
      location: "Najaf, Iraq",
      period: "April 2023 – Present",
      description: "Dual-role combining software development with graduate employment services",
      responsibilities: [
        "Developed comprehensive graduate tracking platform for monitoring career outcomes",
        "Created Information Bank Smart App for university contests and competitions",
        "Built internal web applications for lab scheduling, inventory, and reporting using Django and React",
        "Provided technical support in Electronic and Communications Engineering laboratories"
      ],
      leadership: [
        "Mentored three agile student teams (3 members each) on Transportation Management System project",
        "Guided Git workflow, Go microservice patterns, and agile delivery to optimize campus bus routes",
        "Web Team: Introduced React and modern web development best practices",
        "Backend Team: Trained students on relational database design and C# REST API implementation",
        "Mobile Team: Coached UI/UX principles and Flutter development for cross-platform deployment"
      ],
      technologies: ["Go", "Django", "React", "PostgreSQL", "Docker", "C#", "Flutter"]
    },
    {
      title: "Software Engineer / Backend Team Lead",
      company: "Al Qaseh for Financial Solutions and Electronic Payment",
      location: "Najaf, Iraq",
      period: "August 2022 – June 1, 2025",
      description: "Building secure financial infrastructure for digital payment systems",
      responsibilities: [
        "Specialized in backend development using Golang and PostgreSQL with strong focus on security and system robustness",
        "Designed and maintained Go-based REST/gRPC microservices with PostgreSQL and Redis backends",
        "Implemented encryption, JWT/mTLS authentication, RBAC, and PCI-DSS compliant 3-D Secure payment flows",
        "Delivered 10+ projects including business portal for merchants and consumer mobile app"
      ],
      leadership: [
        "Led cross-functional backend squad of 3 developers for 10 months (October 2023 - July 2024)",
        "Instituted pull-request reviews, issue triage, and sprint retrospectives",
        "Drove secure API design, Golang best practices, and PostgreSQL optimization",
        "Coordinated with mobile and web teams to align API contracts and release schedules"
      ],
      technologies: ["Go", "PostgreSQL", "Redis", "gRPC", "JWT", "mTLS", "PCI-DSS"]
    },
    {
      title: "Web Developer",
      company: "Morabaa Software Solutions",
      location: "Najaf, Iraq",
      period: "January 2022 – July 2022",
      description: "Frontend and full-stack web development",
      responsibilities: [
        "Developed responsive web applications with focus on user experience and brand consistency",
        "Built reusable component library that cut UI build time by 30% for subsequent projects",
        "Ensured mobile-friendly layouts balancing functionality with aesthetic design"
      ],
      technologies: ["React", "JavaScript", "CSS3", "HTML5"]
    },
    {
      title: "Frontend Developer",
      company: "Al-Aaml",
      location: "Najaf, Iraq",
      period: "August 2021 – October 2021",
      description: "Frontend development focusing on user interface design and implementation",
      responsibilities: [
        "Frontend development focusing on user interface design and implementation"
      ],
      technologies: ["JavaScript", "CSS3", "HTML5"]
    }
  ]

  const education = [
    {
      degree: "Bachelor of Science in Electronic & Communications Engineering",
      institution: "University of Kufa",
      location: "Najaf, Iraq",
      period: "March 2017 – July 2021",
      gpa: "81.256/100 (Ranked 3rd in Class)",
      project: "Real-time Classification of Falls and Activities of Daily Living Using a CNN-LSTM Network – Achieved A+ grade focusing on AI and deep learning applications"
    },
    {
      degree: "Diploma in Computer Techniques Engineering",
      institution: "Najaf Technical Institute, Al-Furat Al-Awsat Technical University",
      location: "Najaf, Iraq",
      period: "October 2015 – June 2017",
      gpa: "87.85/100 (Valedictorian - Ranked 1st)",
      project: "Smart Home System Using IoT Intelligent Control – Designed sensor-driven automation using ESP8266 and Node-RED"
    }
  ]

  const projects = [
    {
      title: "Kufa Graduates Platform",
      period: "May 2023 – Present",
      description: "User-friendly platform connecting University of Kufa graduates with employers, featuring personalized portfolios and job posting capabilities.",
      technologies: ["Go", "PostgreSQL", "Next.js", "Docker"]
    },
    {
      title: "Arabic Roman Conv",
      period: "July 2023 – Present",
      description: "Flutter package for converting Arabic names and phrases to Romanized English counterparts.",
      technologies: ["Dart", "Flutter"]
    },
    {
      title: "Qaseh Consumer App Backend",
      period: "August 2022 – January 2024",
      description: "Backend infrastructure for consumer mobile app on iOS and Android, focusing on scalable APIs and secure financial solutions.",
      technologies: ["Go", "PostgreSQL", "RESTful API"]
    }
  ]

  const skills = {
    "Programming Languages": ["Go", "Python", "JavaScript", "TypeScript", "Dart", "C#"],
    "Frontend Technologies": ["Flutter", "React", "Next.js", "Tailwind CSS"],
    "Backend & Databases": ["PostgreSQL", "Redis", "RESTful APIs", "Microservices"],
    "DevOps & Tools": ["Docker", "CI/CD", "Git", "Unit Testing", "System Design"]
  }

  const publications = [
    {
      title: "Real-time Classification of Various Types of Falls and Activities of Daily Living Based on a CNN-LSTM Network",
      authors: "Al-Majdi K., Al-Musawi R.S.H., Ali A.H., Fatlawi S.A., & Mezaal Y.S.",
      journal: "Periodicals of Engineering and Natural Sciences",
      details: "9(3): 958-969, 2021"
    }
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-900 py-20 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 id="resume-heading" className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
              Resume
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Software Engineer with 3+ years of experience in backend and frontend development
            </p>
            <button
              onClick={handleDownloadResume}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Full CV
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Skills */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">saifalialjanahi@gmail.com</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">+964 782 208 4101</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">Najaf, Iraq</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Github className="w-4 h-4 mr-3 text-slate-400" />
                    <a href="https://github.com/1saifj" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      github.com/1saifj
                    </a>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Linkedin className="w-4 h-4 mr-3 text-slate-400" />
                    <a href="https://linkedin.com/in/1saifj" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      LinkedIn Profile
                    </a>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <ExternalLink className="w-4 h-4 mr-3 text-slate-400" />
                    <a href="https://www.1saif.me" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      www.1saif.me
                    </a>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Technical Skills
                </h3>
                <div className="space-y-4">
                  {Object.entries(skills).map(([category, skillList]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillList.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Languages</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Arabic</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Native</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">English</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Professional (IELTS 6.0)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Experience & Education */}
            <div className="lg:col-span-2 space-y-8">
              {/* Professional Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Professional Summary</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Software Engineer with 3+ years of experience in backend and frontend development, specializing in 
                  Golang, Flutter, and scalable system design. Proven expertise in financial technology solutions, 
                  clean architecture principles, and security best practices. Published researcher with strong 
                  background in AI/ML applications and team leadership experience.
                </p>
              </div>

              {/* Professional Experience */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Professional Experience
                </h3>
                <div className="space-y-8">
                  {experience.map((job, index) => (
                    <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{job.title}</h4>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mb-1">
                        <span>{job.company}</span>
                        <span className="mx-2">•</span>
                        <span className="text-slate-500 dark:text-slate-400">{job.location}</span>
                      </div>
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-3">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{job.period}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed italic">
                        {job.description}
                      </p>
                      
                      {/* Main Responsibilities */}
                      <div className="mb-3">
                        <ul className="space-y-1">
                          {job.responsibilities.map((resp, idx) => (
                            <li key={idx} className="flex items-start text-slate-600 dark:text-slate-300 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Leadership section if exists */}
                      {job.leadership && job.leadership.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Leadership & Mentoring</h5>
                          <ul className="space-y-1">
                            {job.leadership.map((lead, idx) => (
                              <li key={idx} className="flex items-start text-slate-600 dark:text-slate-300 text-sm">
                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                <span>{lead}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {job.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  Education
                </h3>
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{edu.degree}</h4>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mb-1">
                        <span>{edu.institution}</span>
                        <span className="mx-2">•</span>
                        <span className="text-slate-500 dark:text-slate-400">{edu.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{edu.period}</span>
                        </div>
                        <span className="font-medium">GPA: {edu.gpa}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        <strong>Graduation Project:</strong> <em>{edu.project}</em>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notable Projects */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Notable Projects
                </h3>
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{project.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{project.period}</p>
                      <p className="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publications */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Publications
                </h3>
                <div className="space-y-4">
                  {publications.map((pub, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-3 border-blue-600">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{pub.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-1">
                        <span className="font-medium">Authors:</span> {pub.authors}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        <em>{pub.journal}</em>, {pub.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Career Timeline */}
          <div className="mt-12">
            <CareerTimeline />
          </div>
        </div>
      </div>
    </div>
  )
} 