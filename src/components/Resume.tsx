import React from 'react'
import { Download, MapPin, Phone, Mail, Github, Linkedin, Calendar, Award, GraduationCap, Briefcase } from 'lucide-react'
import { CareerTimeline } from './CareerTimeline'

export const Resume: React.FC = () => {
  const handleDownloadResume = () => {
    const link = document.createElement('a')
    link.href = '/saif-aljanahi-resume.pdf'
    link.download = 'Saif-Aljanahi-Resume.pdf'
    link.click()
  }

  const experience = [
    {
      title: "Software Engineer (Backend Team Lead)",
      company: "AlQaseh",
      location: "An Najaf, Iraq",
      period: "September 2022 - Present",
      description: "Leading backend development team for financial transaction systems using Golang and clean architecture principles. Implemented secure payment processing solutions and optimized system performance by 40%.",
      technologies: ["Golang", "PostgreSQL", "Redis", "Docker", "Kubernetes", "gRPC"]
    },
    {
      title: "Full Stack Developer",
      company: "Freelance",
      location: "Remote",
      period: "January 2021 - August 2022",
      description: "Developed custom web applications for various clients using React, Node.js, and modern deployment practices. Specialized in e-commerce platforms and business management systems.",
      technologies: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"]
    }
  ]

  const education = [
    {
      degree: "Bachelor of Science in Software Engineering",
      institution: "University of Kufa",
      location: "An Najaf, Iraq",
      period: "2018 - 2022",
      gpa: "3.8/4.0"
    }
  ]

  const skills = {
    "Programming Languages": ["Go", "TypeScript", "JavaScript", "Python", "Java"],
    "Backend Technologies": ["Node.js", "Express", "Gin", "PostgreSQL", "MongoDB", "Redis"],
    "Frontend Technologies": ["React", "Next.js", "Vue.js", "Tailwind CSS", "HTML5", "CSS3"],
    "DevOps & Tools": ["Docker", "Kubernetes", "AWS", "Git", "GitHub Actions", "Nginx"],
    "Architecture & Patterns": ["Clean Architecture", "Microservices", "RESTful APIs", "GraphQL", "Event-Driven Architecture"]
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 py-20 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
              Resume
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              A comprehensive overview of my professional experience and skills
            </p>
            <button
              onClick={handleDownloadResume}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF Resume
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
                    <span className="text-sm">+964 780 123 4567</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">An Najaf, Iraq</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Github className="w-4 h-4 mr-3 text-slate-400" />
                    <a href="https://github.com/saifaliaxioned" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      github.com/saifaliaxioned
                    </a>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Linkedin className="w-4 h-4 mr-3 text-slate-400" />
                    <a href="https://linkedin.com/in/saif-ali-aljanahi" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Skills
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
            </div>

            {/* Right Column - Experience & Education */}
            <div className="lg:col-span-2 space-y-8">
              {/* Professional Experience */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Professional Experience
                </h3>
                <div className="space-y-6">
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
                      <p className="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                        {job.description}
                      </p>
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
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{edu.degree}</h4>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mb-1">
                        <span>{edu.institution}</span>
                        <span className="mx-2">•</span>
                        <span className="text-slate-500 dark:text-slate-400">{edu.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{edu.period}</span>
                        </div>
                        <span className="font-medium">GPA: {edu.gpa}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Achievements */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Key Achievements
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Led a team of 5 developers in implementing a payment processing system handling $1M+ monthly transactions</span>
                  </li>
                  <li className="flex items-start text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Optimized backend API performance, reducing response time by 40% and improving user experience</span>
                  </li>
                  <li className="flex items-start text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Delivered 15+ full-stack applications for clients across various industries with 100% client satisfaction</span>
                  </li>
                  <li className="flex items-start text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Implemented CI/CD pipelines reducing deployment time by 60% and improving code quality</span>
                  </li>
                </ul>
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