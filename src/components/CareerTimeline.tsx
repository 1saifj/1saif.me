import React from 'react'
import { Calendar, MapPin, Building, Users, TrendingUp, Award, GraduationCap } from 'lucide-react'

interface TimelineItem {
  id: string
  title: string
  company: string
  location: string
  period: string
  description: string
  responsibilities: string[]
  leadership?: string[]
  technologies: string[]
  achievements?: string[]
  type: 'work' | 'education'
}

export const CareerTimeline: React.FC = () => {
  const timelineItems: TimelineItem[] = [
    {
      id: '1',
      title: 'Assistant Engineer - Software Development & Graduate Services',
      company: 'University of Kufa',
      location: 'Najaf, Iraq',
      period: 'April 2023 – Present',
      description: 'Dual-role combining software development with graduate employment services',
      responsibilities: [
        'Developed comprehensive graduate tracking platform for monitoring career outcomes',
        'Created Information Bank Smart App for university contests and competitions',
        'Built internal web applications for lab scheduling, inventory, and reporting using Django and React',
        'Provided technical support in Electronic and Communications Engineering laboratories'
      ],
      leadership: [
        'Mentored three agile student teams (3 members each) on Transportation Management System project',
        'Guided Git workflow, Go microservice patterns, and agile delivery to optimize campus bus routes',
        'Web Team: Introduced React and modern web development best practices',
        'Backend Team: Trained students on relational database design and C# REST API implementation',
        'Mobile Team: Coached UI/UX principles and Flutter development for cross-platform deployment'
      ],
      technologies: ['Go', 'Django', 'React', 'PostgreSQL', 'Docker', 'C#', 'Flutter'],
      type: 'work'
    },
    {
      id: '2',
      title: 'Software Engineer / Backend Team Lead',
      company: 'Al Qaseh for Financial Solutions and Electronic Payment',
      location: 'Najaf, Iraq',
      period: 'August 2022 – June 1, 2025',
      description: 'Building secure financial infrastructure for digital payment systems',
      responsibilities: [
        'Specialized in backend development using Golang and PostgreSQL with strong focus on security and system robustness',
        'Designed and maintained Go-based REST/gRPC microservices with PostgreSQL and Redis backends',
        'Implemented encryption, JWT/mTLS authentication, RBAC, and PCI-DSS compliant 3-D Secure payment flows',
        'Delivered 10+ projects including business portal for merchants and consumer mobile app'
      ],
      leadership: [
        'Led cross-functional backend squad of 3 developers for 10 months (October 2023 - July 2024)',
        'Instituted pull-request reviews, issue triage, and sprint retrospectives',
        'Drove secure API design, Golang best practices, and PostgreSQL optimization',
        'Coordinated with mobile and web teams to align API contracts and release schedules'
      ],
      technologies: ['Go', 'PostgreSQL', 'Redis', 'gRPC', 'JWT', 'mTLS', 'PCI-DSS'],
      type: 'work'
    },
    {
      id: '3',
      title: 'Web Developer',
      company: 'Morabaa Software Solutions',
      location: 'Najaf, Iraq',
      period: 'January 2022 – July 2022',
      description: 'Frontend and full-stack web development with focus on user experience',
      responsibilities: [
        'Developed responsive web applications with focus on user experience and brand consistency',
        'Built reusable component library that cut UI build time by 30% for subsequent projects',
        'Ensured mobile-friendly layouts balancing functionality with aesthetic design'
      ],
      technologies: ['React', 'JavaScript', 'CSS3', 'HTML5', 'Responsive Design'],
      type: 'work'
    },
    {
      id: '4',
      title: 'Frontend Developer',
      company: 'Al-Aaml',
      location: 'Najaf, Iraq',
      period: 'August 2021 – October 2021',
      description: 'Frontend development focusing on user interface design and implementation',
      responsibilities: [
        'Frontend development focusing on user interface design and implementation'
      ],
      technologies: ['JavaScript', 'CSS3', 'HTML5', 'UI/UX Design'],
      type: 'work'
    },
    {
      id: '5',
      title: 'Bachelor of Science in Electronic & Communications Engineering',
      company: 'University of Kufa',
      location: 'Najaf, Iraq',
      period: 'March 2017 – July 2021',
      description: 'GPA: 81.256/100 | Ranked 3rd in Class',
      responsibilities: [
        'Graduation Project: Real-time Classification of Falls and Activities of Daily Living Using a CNN-LSTM Network',
        'Achieved A+ grade focusing on AI and deep learning applications'
      ],
      technologies: ['AI', 'Deep Learning', 'CNN-LSTM', 'Python', 'Machine Learning'],
      type: 'education'
    },
    {
      id: '6',
      title: 'Diploma in Computer Techniques Engineering',
      company: 'Najaf Technical Institute, Al-Furat Al-Awsat Technical University',
      location: 'Najaf, Iraq',
      period: 'October 2015 – June 2017',
      description: 'GPA: 87.85/100 | Valedictorian (Ranked 1st)',
      responsibilities: [
        'Graduation Project: Smart Home System Using IoT Intelligent Control',
        'Designed sensor-driven automation using ESP8266 and Node-RED'
      ],
      technologies: ['IoT', 'ESP8266', 'Node-RED', 'Automation', 'Sensors'],
      type: 'education'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work':
        return Building
      case 'education':
        return GraduationCap
      default:
        return Building
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'from-blue-600 to-cyan-600'
      case 'education':
        return 'from-purple-600 to-pink-600'
      default:
        return 'from-blue-600 to-cyan-600'
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calendar className="w-4 h-4" />
          <span>Career Journey</span>
        </div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Professional Timeline
        </h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          A journey through software engineering excellence, from academic foundations to industry leadership.
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-green-600 rounded-full"></div>

        <div className="space-y-12">
          {timelineItems.map((item, index) => {
            const IconComponent = getTypeIcon(item.type)
            const colorClass = getTypeColor(item.type)
            
            return (
              <div key={item.id} className="relative flex items-start space-x-8">
                {/* Timeline dot with icon */}
                <div className={`relative z-10 bg-gradient-to-r ${colorClass} rounded-xl p-3 shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                    {/* Header */}
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span className="font-medium">{item.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{item.period}</span>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Responsibilities */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{item.type === 'education' ? 'Academic Highlights' : 'Key Responsibilities'}</span>
                      </h5>
                      <ul className="space-y-2">
                        {item.responsibilities.map((resp, i) => (
                          <li key={i} className="text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Leadership (only for work items with leadership) */}
                    {item.leadership && item.leadership.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Leadership & Mentoring</span>
                        </h5>
                        <ul className="space-y-1">
                          {item.leadership.map((leader, i) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                              <Award className="w-3 h-3 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                              <span>{leader}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technologies */}
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Technologies</h5>
                      <div className="flex flex-wrap gap-2">
                        {item.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>


    </div>
  )
} 