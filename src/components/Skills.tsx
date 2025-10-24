import React from 'react'
import { Code, Database, Globe, Settings } from 'lucide-react'

export const Skills: React.FC = () => {
  const skillCategories = [
    {
      name: "Programming Languages",
      icon: Code,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      skills: [
        { name: "Go", level: 85 },
        { name: "Python", level: 80 },
        { name: "JavaScript", level: 85 },
        { name: "TypeScript", level: 75 },
        { name: "Dart", level: 70 }
      ]
    },
    {
      name: "Frontend Technologies",
      icon: Globe,
      color: "green",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-500/10 to-emerald-600/10",
      skills: [
        { name: "React", level: 80 },
        { name: "Flutter", level: 75 },
        { name: "HTML/CSS", level: 85 },
        { name: "Tailwind CSS", level: 80 }
      ]
    },
    {
      name: "Backend & Databases",
      icon: Database,
      color: "purple",
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-500/10 to-violet-600/10",
      skills: [
        { name: "PostgreSQL", level: 80 },
        { name: "Redis", level: 70 },
        { name: "REST APIs", level: 85 },
        { name: "Node.js", level: 75 }
      ]
    },
    {
      name: "Tools & DevOps",
      icon: Settings,
      color: "orange",
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-500/10 to-amber-600/10",
      skills: [
        { name: "Git", level: 85 },
        { name: "Docker", level: 70 },
        { name: "Linux", level: 75 },
        { name: "VS Code", level: 90 }
      ]
    }
  ]

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Technical Skills
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Technologies and tools I work with to build modern software solutions
            </p>
          </div>

          {/* Technical Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {skillCategories.map((category) => {
              const IconComponent = category.icon
              
              return (
                <div 
                  key={category.name} 
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {category.name}
                      </h3>
                    </div>

                    {/* Skills List */}
                    <div className="space-y-5">
                      {category.skills.map((skill) => (
                        <div key={skill.name} className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {skill.name}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                              {skill.level}%
                            </span>
                          </div>
                          <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${category.gradient} rounded-full shadow-sm`}
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
