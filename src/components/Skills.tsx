import React from 'react'

export const Skills: React.FC = () => {
  const languages = [
    { name: 'Golang', level: 95, color: 'bg-cyan-500 dark:bg-cyan-400' },
    { name: 'Python', level: 90, color: 'bg-blue-600 dark:bg-blue-500' },
    { name: 'Flutter/Dart', level: 85, color: 'bg-blue-400 dark:bg-blue-300' },
    { name: 'JavaScript/TypeScript', level: 85, color: 'bg-yellow-500 dark:bg-yellow-400' },
    { name: 'React/NextJS', level: 80, color: 'bg-cyan-400 dark:bg-cyan-300' }
  ]

  const topSkills = [
    'Systems Design', 'Back-End Web Development', 'Team Building'
  ]

  const technologies = [
    'Golang', 'Python', 'Flutter', 'PostgreSQL', 'React', 'NextJS', 
    'Clean Architecture', 'E2E Testing', 'Security & Encryption', 'Git',
    'Docker', 'System Architecture', 'Database Design', 'API Development'
  ]

  const languageSkills = [
    { name: 'English', level: 'Professional Working' },
    { name: 'Arabic', level: 'Native or Bilingual' }
  ]

  return (
    <section className="py-20 bg-white dark:bg-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
              Technical Skills
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto transition-colors duration-300">
              Expertise across modern development technologies with focus on backend systems and clean architecture
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Top Skills */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Top Skills</h3>
              <div className="space-y-3">
                {topSkills.map((skill, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white rounded-lg px-6 py-4 font-semibold text-center shadow-lg transition-all duration-300">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Language Proficiency */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Languages</h3>
              <div className="space-y-4">
                {languageSkills.map((lang, index) => (
                  <div key={index} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 transition-colors duration-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-300">{lang.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">{lang.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Programming Languages */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Programming Languages</h3>
              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-300">{lang.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">{lang.level}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 transition-colors duration-300">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${lang.color} group-hover:shadow-lg`}
                        style={{ width: `${lang.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies & Tools */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">Technologies & Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                {technologies.map((tech, index) => (
                  <div 
                    key={index}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-200 transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    {tech}
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