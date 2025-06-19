import React from 'react'
import { Code, Database, Globe, Settings, Zap, Award } from 'lucide-react'

export const Skills: React.FC = () => {
  const skillCategories = [
    {
      name: "Programming Languages",
      icon: Code,
      color: "blue",
      skills: [
        { name: "Go", level: 95, description: "Backend microservices, gRPC" },
        { name: "Python", level: 85, description: "Django, data processing" },
        { name: "JavaScript", level: 90, description: "ES6+, Node.js, React" },
        { name: "TypeScript", level: 85, description: "Type-safe development" },
        { name: "Dart", level: 80, description: "Flutter development" },
        { name: "C#", level: 75, description: "REST APIs, mentoring" }
      ]
    },
    {
      name: "Frontend Technologies",
      icon: Globe,
      color: "green",
      skills: [
        { name: "React", level: 90, description: "Hooks, Context, modern patterns" },
        { name: "Flutter", level: 85, description: "Cross-platform mobile apps" },
        { name: "Next.js", level: 80, description: "SSR, API routes" },
        { name: "Tailwind CSS", level: 90, description: "Utility-first styling" }
      ]
    },
    {
      name: "Backend & Databases",
      icon: Database,
      color: "purple",
      skills: [
        { name: "PostgreSQL", level: 90, description: "Complex queries, optimization" },
        { name: "Redis", level: 80, description: "Caching, sessions" },
        { name: "RESTful APIs", level: 95, description: "Design, security, documentation" },
        { name: "Microservices", level: 85, description: "Architecture, deployment" }
      ]
    },
    {
      name: "DevOps & Tools",
      icon: Settings,
      color: "orange",
      skills: [
        { name: "Docker", level: 85, description: "Containerization, orchestration" },
        { name: "CI/CD", level: 80, description: "GitLab, automated deployment" },
        { name: "Git", level: 90, description: "Workflow, collaboration" },
        { name: "System Design", level: 85, description: "Scalable architecture" }
      ]
    }
  ]

  const topSkills = [
    'Systems Design', 'Back-End Web Development', 'Team Building'
  ]

  const languageSkills = [
    { name: 'English', level: 'Professional Working (IELTS 6.0)' },
    { name: 'Arabic', level: 'Native or Bilingual' }
  ]

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="skills-heading" className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
              Technical Skills & Technology Stack
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto transition-colors duration-300">
              Expertise across modern development technologies with focus on backend systems and clean architecture
            </p>
          </div>

          {/* Technical Skills - Enhanced Design */}
          <div className="mb-16">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {skillCategories.map((category) => {
                  const IconComponent = category.icon
                  const colorClasses = {
                    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                    green: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
                    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  }
                  
                  return (
                    <div key={category.name} className={`rounded-lg border-2 p-6 hover:shadow-lg transition-all duration-300 ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 rounded-lg ${colorClasses[category.color as keyof typeof colorClasses]} flex items-center justify-center mr-3 shadow-sm`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                          {category.name}
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {category.skills.map((skill) => (
                          <div key={skill.name} className="group/skill">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {skill.name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                {skill.level}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out rounded-full bg-gradient-to-r shadow-sm ${
                                  category.color === 'blue' ? 'from-blue-400 to-blue-600' :
                                  category.color === 'green' ? 'from-green-400 to-green-600' :
                                  category.color === 'purple' ? 'from-purple-400 to-purple-600' :
                                  'from-orange-400 to-orange-600'
                                }`}
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 opacity-0 group-hover/skill:opacity-100 transition-opacity duration-200 italic">
                              {skill.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Top Skills */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300 flex items-center">
                <Award className="w-6 h-6 mr-3 text-blue-600" />
                Core Expertise
              </h3>
              <div className="space-y-3">
                {topSkills.map((skill, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white rounded-lg px-6 py-4 font-semibold text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Language Proficiency */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-green-600" />
                Languages
              </h3>
              <div className="space-y-4">
                {languageSkills.map((lang, index) => (
                  <div key={index} className="bg-white dark:bg-slate-700 rounded-lg p-4 transition-colors duration-300 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-300">{lang.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">{lang.level}</span>
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