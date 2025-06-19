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
    <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
              About Saif Aljanahi
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
              <strong>Full-Stack Engineer</strong> with 3+ years of experience building enterprise-grade systems. 
              Specialized in <strong>Golang backend development</strong>, <strong>financial technology</strong>, and 
              <strong>scalable architecture</strong> with a proven track record of leading high-performance teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Professional Journey</h3>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                <p>
                  As a <strong className="text-slate-900 dark:text-white">Full-Stack Engineer</strong> with deep expertise in 
                  <strong className="text-slate-900 dark:text-white"> Golang</strong>, <strong className="text-slate-900 dark:text-white">TypeScript</strong>, 
                  and <strong className="text-slate-900 dark:text-white">Clean Architecture</strong>, I specialize in building mission-critical 
                  financial systems that process millions of dollars in transactions while maintaining the highest security standards.
                </p>
                <p>
                  My leadership experience includes <strong className="text-slate-900 dark:text-white">leading cross-functional teams</strong> of 5+ developers, 
                  establishing engineering best practices, and implementing <strong className="text-slate-900 dark:text-white">CI/CD pipelines</strong> that 
                  reduced deployment time by 60%. I've successfully delivered <strong className="text-slate-900 dark:text-white">PCI DSS compliant systems</strong> 
                  and achieved <strong className="text-slate-900 dark:text-white">99.9% system uptime</strong> in production environments.
                </p>
                <p>
                  Currently serving as <strong className="text-slate-900 dark:text-white">Backend Team Lead at AlQaseh</strong>, I architect and maintain 
                  enterprise-grade financial systems while mentoring junior developers and driving technical innovation. My passion for 
                  <strong className="text-slate-900 dark:text-white"> performance optimization</strong> and <strong className="text-slate-900 dark:text-white"> scalable architecture</strong> 
                  has resulted in systems that serve thousands of concurrent users with sub-200ms response times.
                </p>
              </div>

              {/* Call to Action */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
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
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Core Technical Expertise</h3>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index} className="group">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 flex-shrink-0 transition-all duration-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                        <skill.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{skill.title}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed transition-colors duration-300">{skill.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}