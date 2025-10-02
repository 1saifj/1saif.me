import React from 'react'
import { Code, Database, Globe, Settings } from 'lucide-react'

export const Skills: React.FC = () => {
  const skillCategories = [
    {
      name: "Programming Languages",
      icon: Code,
      color: "blue",
      skills: [
        { name: "Go", level: 85, description: "Backend services, APIs" },
        { name: "Python", level: 80, description: "Web development, scripting" },
        { name: "JavaScript", level: 85, description: "Frontend, Node.js" },
        { name: "TypeScript", level: 75, description: "Type-safe development" },
        { name: "Dart", level: 70, description: "Flutter development" }
      ]
    },
    {
      name: "Frontend Technologies",
      icon: Globe,
      color: "green",
      skills: [
        { name: "React", level: 80, description: "Components, hooks, state" },
        { name: "Flutter", level: 75, description: "Mobile app development" },
        { name: "HTML/CSS", level: 85, description: "Semantic markup, styling" },
        { name: "Tailwind CSS", level: 80, description: "Utility-first CSS" }
      ]
    },
    {
      name: "Backend & Databases",
      icon: Database,
      color: "purple",
      skills: [
        { name: "PostgreSQL", level: 80, description: "Database design, queries" },
        { name: "Redis", level: 70, description: "Caching, sessions" },
        { name: "REST APIs", level: 85, description: "API design and development" },
        { name: "Node.js", level: 75, description: "Server-side JavaScript" }
      ]
    },
    {
      name: "Tools & DevOps",
      icon: Settings,
      color: "orange",
      skills: [
        { name: "Git", level: 85, description: "Version control, collaboration" },
        { name: "Docker", level: 70, description: "Containerization" },
        { name: "Linux", level: 75, description: "Command line, servers" },
        { name: "VS Code", level: 90, description: "Development environment" }
      ]
    }
  ]

  const languageSkills = [
    { name: 'English', level: 'Professional Working' },
    { name: 'Arabic', level: 'Native' }
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
              Technical Skills
            </h2>
            <div className="w-12 sm:w-16 h-0.5 bg-slate-300 dark:bg-slate-600 mx-auto mb-4 xs:mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
              Technologies and tools I work with to build modern software solutions
            </p>
          </div>

          {/* Technical Skills Grid */}
          <div className="mb-12 sm:mb-16">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 xs:p-5 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
                {skillCategories.map((category) => {
                  const IconComponent = category.icon
                  const colorClasses = {
                    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
                    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
                    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                  }
                  
                  return (
                    <div key={category.name} className="space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">
                          {category.name}
                        </h4>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {category.skills.map((skill) => (
                          <div key={skill.name} className="group">
                            <div className="flex justify-between items-center mb-1 sm:mb-2">
                              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                                {skill.name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {skill.level}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 sm:h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out ${
                                  category.color === 'blue' ? 'bg-blue-500' :
                                  category.color === 'green' ? 'bg-green-500' :
                                  category.color === 'purple' ? 'bg-purple-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

         </div>
      </div>
    </section>
  )
}