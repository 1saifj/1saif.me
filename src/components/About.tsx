import React from 'react'
import { Code2, Database, Shield, Users, Globe, Zap } from 'lucide-react'

export const About: React.FC = () => {
  const skills = [
    {
      icon: Code2,
      title: "Full-Stack Development",
      description: "Expert in Golang, TypeScript, React, and modern web technologies for building scalable applications"
    },
    {
      icon: Database,
      title: "Backend Architecture", 
      description: "Specialized in PostgreSQL, microservices, and clean architecture principles for enterprise systems"
    },
    {
      icon: Shield,
      title: "Security & Performance",
      description: "PCI DSS compliance, end-to-end encryption, and performance optimization achieving 99.9% uptime"
    },
    {
      icon: Users,
      title: "Team Leadership",
      description: "Led teams of 5+ developers, mentored junior staff, and improved code quality by 60%"
    },
    {
      icon: Globe,
      title: "System Architecture",
      description: "Designed systems handling 10,000+ concurrent users and $1M+ monthly transaction volume"
    },
    {
      icon: Zap,
      title: "DevOps & Testing",
      description: "CI/CD pipelines, automated testing, and comprehensive E2E testing practices"
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              About Saif Aljanahi
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Full-Stack Engineer with 3+ years of experience building enterprise-grade systems. 
              Specialized in Golang backend development, financial technology, and scalable architecture 
              with a proven track record of leading high-performance teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Professional Journey</h3>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  As a Full-Stack Engineer with deep expertise in Golang, TypeScript, and Clean Architecture, 
                  I specialize in building mission-critical financial systems that process millions of dollars 
                  in transactions while maintaining the highest security standards.
                </p>
                <p>
                  My leadership experience includes leading cross-functional teams of 5+ developers, establishing 
                  engineering best practices, and implementing CI/CD pipelines that reduced deployment time by 60%. 
                  I've successfully delivered PCI DSS compliant systems and achieved 99.9% system uptime in production environments.
                </p>
                <p>
                  Currently serving as Backend Team Lead at AlQaseh, I architect and maintain enterprise-grade 
                  financial systems while mentoring junior developers and driving technical innovation. My passion 
                  for performance optimization and scalable architecture has resulted in systems that serve thousands 
                  of concurrent users with sub-200ms response times.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Core Technical Expertise</h3>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 flex-shrink-0">
                      <skill.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{skill.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{skill.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Ready to collaborate?</h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              I'm always interested in discussing new opportunities, technical challenges, and innovative projects.
            </p>
            <a 
              href="#contact" 
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              Get in touch →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
