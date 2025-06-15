import React from 'react'
import { Calendar, MapPin, Building, Users, TrendingUp, Award } from 'lucide-react'

interface TimelineItem {
  id: string
  title: string
  company: string
  location: string
  period: string
  description: string[]
  technologies: string[]
  achievements: string[]
  type: 'work' | 'education' | 'freelance'
}

export const CareerTimeline: React.FC = () => {
  const timelineItems: TimelineItem[] = [
    {
      id: '4',
      title: 'Software Engineer (Backend Team Lead)',
      company: 'AlQaseh',
      location: 'An Najaf, Iraq',
      period: 'September 2022 - Present',
      description: [
        'Leading backend development team for financial transaction systems',
        'Architecting scalable microservices using Golang and clean architecture',
        'Implementing secure payment processing with PCI DSS compliance'
      ],
      technologies: ['Golang', 'PostgreSQL', 'Docker', 'Kubernetes', 'gRPC', 'Redis'],
      achievements: [
        'Improved system performance by 40% through optimization',
        'Led team of 5 developers in delivering critical features',
        'Implemented security protocols resulting in zero security incidents',
        'Processed $1M+ in monthly transactions with 99.9% uptime'
      ],
      type: 'work'
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      company: 'NRCM',
      location: 'An Najaf, Iraq',
      period: 'April 2022 - September 2022',
      description: [
        'Developed healthcare management systems with Django and React',
        'Collaborated with medical professionals to create user-friendly interfaces',
        'Optimized database queries reducing response times by 60%'
      ],
      technologies: ['Django', 'React', 'PostgreSQL', 'Docker', 'REST APIs'],
      achievements: [
        'Delivered patient management system serving 10,000+ users',
        'Reduced system response time by 60% through optimization',
        'Achieved 99.5% system uptime during critical operations'
      ],
      type: 'work'
    },
    {
      id: '2',
      title: 'Freelance Developer',
      company: 'Independent',
      location: 'Remote',
      period: 'January 2021 - April 2022',
      description: [
        'Built custom web applications for international clients',
        'Specialized in e-commerce platforms and business automation',
        'Delivered projects across multiple technology stacks'
      ],
      technologies: ['Python', 'JavaScript', 'React', 'Django', 'AWS', 'Stripe'],
      achievements: [
        'Successfully delivered 15+ projects to satisfied clients',
        'Built e-commerce platforms generating $100K+ in client revenue',
        'Maintained 5-star rating across all freelance platforms'
      ],
      type: 'freelance'
    },
    {
      id: '1',
      title: 'Bachelor of Engineering in Software Engineering',
      company: 'University of Kufa',
      location: 'An Najaf, Iraq',
      period: '2018 - 2022',
      description: [
        'Focused on software architecture, algorithms, and system design',
        'Completed thesis on distributed systems and microservices',
        'Active in programming competitions and tech communities'
      ],
      technologies: ['Java', 'C++', 'Python', 'Database Design', 'Software Architecture'],
      achievements: [
        'Graduated with Honors (GPA: 3.8/4.0)',
        'Led final year project on distributed chat application',
        'Won university programming competition (2021)'
      ],
      type: 'education'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work':
        return Building
      case 'education':
        return Award
      case 'freelance':
        return Users
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
      case 'freelance':
        return 'from-green-600 to-emerald-600'
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
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <ul className="space-y-2">
                        {item.description.map((desc, i) => (
                          <li key={i} className="text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Achievements */}
                    {item.achievements.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>Key Achievements</span>
                        </h5>
                        <ul className="space-y-1">
                          {item.achievements.map((achievement, i) => (
                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                              <Award className="w-3 h-3 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technologies */}
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Technologies Used
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {item.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
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

      {/* Summary Stats */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">3+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">15+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Projects Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">$1M+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Transactions Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">10K+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Users Served</div>
          </div>
        </div>
      </div>
    </div>
  )
} 