import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, FileText, User, Briefcase, Command, ArrowRight, Clock, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnalytics } from './Analytics'
import { publishedBlogs } from '../data/blogs'
import { projects } from '../data/projects'
import { createSlugFromTitle } from '../utils/slugUtils'

interface SearchResult {
  id: string
  title: string
  type: 'blog' | 'project' | 'page' | 'skill'
  description: string
  url: string
  tags?: string[]
  priority: number
}

interface SearchBoxProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchBox: React.FC<SearchBoxProps> = ({ isOpen, onClose }) => {
  const { trackEvent } = useAnalytics()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample search data - this would typically come from your CMS or API
  // Enhanced search data with comprehensive indices from actual data
  const searchData: SearchResult[] = [
    // Blog posts from actual published data
    ...publishedBlogs.map(blog => ({
      id: `blog_${createSlugFromTitle(blog.title)}`,
      title: blog.title,
      type: 'blog' as const,
      description: blog.description,
      url: `/blog/${createSlugFromTitle(blog.title)}`,
      tags: [...blog.tags, 'article', 'tutorial', 'guide', 'technical'],
      priority: 10
    })),
    
    // Projects from actual project data
    ...projects.map(project => ({
      id: `project_${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      title: project.name,
      type: 'project' as const,
      description: project.description,
      url: `/projects#${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      tags: [project.language, project.sourceType, 'code', 'development', 'portfolio', 'project'].filter(Boolean),
      priority: 9
    })),
    // Main pages with detailed descriptions and keywords
    {
      id: 'page_about',
      title: 'About Me',
      type: 'page',
      description: 'Learn about my background, experience, and journey as a software engineer. Discover my skills, education, and professional growth.',
      url: '/#about',
      tags: ['personal', 'experience', 'background', 'bio', 'story', 'career', 'journey', 'developer', 'engineer', 'about'],
      priority: 8
    },
    {
      id: 'page_projects',
      title: 'Projects Portfolio',
      type: 'page',
      description: 'Explore my portfolio of software projects, technical implementations, and creative solutions. See real-world applications and code examples.',
      url: '/#projects',
      tags: ['portfolio', 'code', 'development', 'showcase', 'work', 'implementations', 'solutions', 'applications', 'projects'],
      priority: 8
    },
    {
      id: 'page_skills',
      title: 'Technical Skills & Technologies',
      type: 'page',
      description: 'Comprehensive overview of my technical skills, programming languages, frameworks, tools, and areas of expertise.',
      url: '/#skills',
      tags: ['skills', 'technologies', 'programming', 'languages', 'frameworks', 'tools', 'expertise', 'abilities', 'tech'],
      priority: 7
    },
    {
      id: 'page_blog',
      title: 'Engineering Blog',
      type: 'page',
      description: 'Technical articles, tutorials, and insights on software engineering, best practices, and emerging technologies.',
      url: '/blog',
      tags: ['blog', 'articles', 'tutorials', 'technical', 'writing', 'insights', 'engineering', 'posts'],
      priority: 7
    },
    {
      id: 'page_contact',
      title: 'Contact & Collaboration',
      type: 'page',
      description: 'Get in touch for collaborations, opportunities, technical discussions, or project partnerships.',
      url: '/#contact',
      tags: ['contact', 'collaboration', 'hiring', 'opportunities', 'partnerships', 'networking', 'reach out', 'connect'],
      priority: 6
    },
    {
      id: 'page_resume',
      title: 'Professional Resume',
      type: 'page',
      description: 'Detailed professional resume showcasing my experience, education, achievements, and career progression.',
      url: '/resume',
      tags: ['resume', 'cv', 'experience', 'education', 'achievements', 'career', 'professional', 'work history'],
      priority: 6
    },
    
    // Technology and skill-specific search entries
    {
      id: 'tech_golang',
      title: 'Go Programming (Golang)',
      type: 'skill',
      description: 'Expertise in Go programming language for backend development, microservices, system programming, and high-performance applications.',
      url: '/#skills',
      tags: ['golang', 'go', 'backend', 'microservices', 'programming', 'language', 'server', 'performance', 'concurrent'],
      priority: 8
    },
    {
      id: 'tech_react',
      title: 'React Development',
      type: 'skill',
      description: 'Frontend development with React, hooks, state management, component architecture, and modern JavaScript/TypeScript.',
      url: '/#skills',
      tags: ['react', 'frontend', 'javascript', 'typescript', 'hooks', 'state', 'ui', 'web', 'components'],
      priority: 8
    },
    {
      id: 'tech_flutter',
      title: 'Flutter Mobile Development',
      type: 'skill',
      description: 'Cross-platform mobile app development using Flutter and Dart for iOS and Android with native performance.',
      url: '/#skills',
      tags: ['flutter', 'mobile', 'dart', 'ios', 'android', 'cross-platform', 'app', 'native'],
      priority: 7
    },
    {
      id: 'tech_python',
      title: 'Python Programming',
      type: 'skill',
      description: 'Python development for web applications, data analysis, automation, machine learning, and backend services.',
      url: '/#skills',
      tags: ['python', 'web', 'data', 'automation', 'backend', 'scripting', 'analysis', 'ml', 'ai'],
      priority: 7
    },
    {
      id: 'tech_typescript',
      title: 'TypeScript Development',
      type: 'skill',
      description: 'Type-safe JavaScript development with TypeScript for better code quality, maintainability, and developer experience.',
      url: '/#skills',
      tags: ['typescript', 'javascript', 'types', 'frontend', 'backend', 'web', 'development', 'type-safe'],
      priority: 7
    },
    {
      id: 'tech_nodejs',
      title: 'Node.js Development',
      type: 'skill',
      description: 'Server-side JavaScript development with Node.js for APIs, microservices, and full-stack applications.',
      url: '/#skills',
      tags: ['nodejs', 'node', 'javascript', 'backend', 'api', 'server', 'fullstack', 'runtime'],
      priority: 7
    },
    {
      id: 'tech_docker',
      title: 'Docker & Containerization',
      type: 'skill',
      description: 'Container technologies, Docker, Kubernetes, and DevOps practices for scalable deployments and infrastructure.',
      url: '/#skills',
      tags: ['docker', 'containers', 'kubernetes', 'devops', 'deployment', 'infrastructure', 'k8s', 'orchestration'],
      priority: 6
    },
    {
      id: 'tech_cloud',
      title: 'Cloud Technologies',
      type: 'skill',
      description: 'Cloud computing with AWS, Google Cloud, Azure, and other cloud platforms for scalable and reliable solutions.',
      url: '/#skills',
      tags: ['cloud', 'aws', 'gcp', 'azure', 'infrastructure', 'scalability', 'deployment', 'serverless'],
      priority: 6
    },
    {
      id: 'tech_database',
      title: 'Database Technologies',
      type: 'skill',
      description: 'Database design and management with PostgreSQL, MongoDB, Redis, and other database technologies.',
      url: '/#skills',
      tags: ['database', 'sql', 'postgresql', 'mongodb', 'redis', 'nosql', 'data', 'storage'],
      priority: 6
    },
    {
      id: 'tech_git',
      title: 'Version Control & Git',
      type: 'skill',
      description: 'Version control systems, Git workflows, GitHub/GitLab, and collaborative development practices.',
      url: '/#skills',
      tags: ['git', 'github', 'gitlab', 'version control', 'vcs', 'collaboration', 'workflow'],
      priority: 5
    },
    
    // Additional technology-specific entries for comprehensive search
    {
      id: 'tech_nextjs',
      title: 'Next.js Development',
      type: 'skill',
      description: 'Full-stack React framework with SSR, SSG, API routes, and modern web development features.',
      url: '/#skills',
      tags: ['nextjs', 'next', 'react', 'ssr', 'ssg', 'fullstack', 'framework', 'web'],
      priority: 7
    },
    {
      id: 'tech_tailwind',
      title: 'Tailwind CSS',
      type: 'skill',
      description: 'Utility-first CSS framework for rapid UI development and responsive design.',
      url: '/#skills',
      tags: ['tailwind', 'css', 'ui', 'design', 'responsive', 'styling', 'frontend'],
      priority: 6
    },
    {
      id: 'tech_graphql',
      title: 'GraphQL',
      type: 'skill',
      description: 'Query language for APIs with efficient data fetching and type-safe schema.',
      url: '/#skills',
      tags: ['graphql', 'api', 'query', 'schema', 'apollo', 'data', 'backend'],
      priority: 6
    },
    {
      id: 'tech_microservices',
      title: 'Microservices Architecture',
      type: 'skill',
      description: 'Distributed system design with microservices, service mesh, and event-driven architecture.',
      url: '/#skills',
      tags: ['microservices', 'architecture', 'distributed', 'services', 'event-driven', 'scalability'],
      priority: 6
    },
    {
      id: 'tech_testing',
      title: 'Testing & Quality Assurance',
      type: 'skill',
      description: 'Unit testing, integration testing, TDD/BDD, and quality assurance practices.',
      url: '/#skills',
      tags: ['testing', 'unit tests', 'integration', 'tdd', 'bdd', 'quality', 'qa', 'jest', 'cypress'],
      priority: 6
    },
    {
      id: 'tech_ai_ml',
      title: 'AI & Machine Learning',
      type: 'skill',
      description: 'Machine learning algorithms, neural networks, and AI integration in applications.',
      url: '/#skills',
      tags: ['ai', 'ml', 'machine learning', 'neural networks', 'tensorflow', 'pytorch', 'algorithms'],
      priority: 5
    },
    {
      id: 'tech_security',
      title: 'Security & Authentication',
      type: 'skill',
      description: 'Application security, authentication systems, OAuth, JWT, and security best practices.',
      url: '/#skills',
      tags: ['security', 'authentication', 'oauth', 'jwt', 'auth', 'encryption', 'cybersecurity'],
      priority: 6
    },
    {
      id: 'tech_performance',
      title: 'Performance Optimization',
      type: 'skill',
      description: 'Application performance tuning, caching strategies, and optimization techniques.',
      url: '/#skills',
      tags: ['performance', 'optimization', 'caching', 'speed', 'efficiency', 'tuning'],
      priority: 5
    },
    {
      id: 'tech_agile',
      title: 'Agile & Project Management',
      type: 'skill',
      description: 'Agile methodologies, Scrum, project management, and team collaboration.',
      url: '/#skills',
      tags: ['agile', 'scrum', 'project management', 'collaboration', 'methodology', 'teamwork'],
      priority: 4
    },
    
    // Topic-specific search entries
    {
      id: 'topic_architecture',
      title: 'System Architecture & Design',
      type: 'skill',
      description: 'Software architecture patterns, system design, scalability, and technical decision making.',
      url: '/#skills',
      tags: ['architecture', 'design', 'patterns', 'system design', 'scalability', 'technical', 'decisions'],
      priority: 7
    },
    {
      id: 'topic_devops',
      title: 'DevOps & Infrastructure',
      type: 'skill',
      description: 'CI/CD pipelines, infrastructure as code, monitoring, and deployment automation.',
      url: '/#skills',
      tags: ['devops', 'cicd', 'infrastructure', 'deployment', 'automation', 'monitoring', 'pipelines'],
      priority: 6
    },
    {
      id: 'topic_opensource',
      title: 'Open Source Contributions',
      type: 'skill',
      description: 'Contributing to open source projects, community involvement, and collaborative development.',
      url: '/projects',
      tags: ['open source', 'oss', 'contributions', 'community', 'github', 'collaboration'],
      priority: 5
    },
    
    // Career and professional entries
    {
      id: 'career_experience',
      title: 'Professional Experience',
      type: 'page',
      description: 'Work experience, career progression, achievements, and professional milestones.',
      url: '/#about',
      tags: ['experience', 'career', 'work', 'professional', 'achievements', 'history', 'employment'],
      priority: 7
    },
    {
      id: 'career_education',
      title: 'Education & Certifications',
      type: 'page',
      description: 'Educational background, degrees, certifications, and continuous learning journey.',
      url: '/#about',
      tags: ['education', 'degree', 'certifications', 'learning', 'university', 'courses', 'training'],
      priority: 6
    },
    
    // Meta entries for common search terms
    {
      id: 'meta_fullstack',
      title: 'Full-Stack Development',
      type: 'skill',
      description: 'End-to-end web development covering frontend, backend, databases, and deployment.',
      url: '/#skills',
      tags: ['fullstack', 'full-stack', 'web development', 'frontend', 'backend', 'complete'],
      priority: 8
    },
    {
      id: 'meta_mobile',
      title: 'Mobile Development',
      type: 'skill',
      description: 'Mobile app development for iOS and Android using various frameworks and technologies.',
      url: '/#skills',
      tags: ['mobile', 'app', 'ios', 'android', 'flutter', 'react native', 'mobile development'],
      priority: 7
    },
    {
      id: 'meta_web',
      title: 'Web Development',
      type: 'skill',
      description: 'Modern web development with responsive design, progressive web apps, and user experience.',
      url: '/#skills',
      tags: ['web', 'website', 'frontend', 'ui', 'ux', 'responsive', 'pwa', 'modern'],
      priority: 8
    }
  ]

  const searchFunction = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return []

    const queryLower = searchQuery.toLowerCase()
    const queryWords = queryLower.split(' ').filter(word => word.length > 0)
    
    return searchData
      .map(item => {
        let score = 0
        const titleLower = item.title.toLowerCase()
        const descLower = item.description.toLowerCase()
        
        // Exact title match gets highest score
        if (titleLower === queryLower) score += 1000
        
        // Title starts with query
        if (titleLower.startsWith(queryLower)) score += 300
        
        // Title contains full query
        if (titleLower.includes(queryLower)) score += 200
        
        // Description contains full query
        if (descLower.includes(queryLower)) score += 100
        
        // Individual word matching in title (for multi-word queries)
        queryWords.forEach(word => {
          if (titleLower.includes(word)) score += 150
          if (descLower.includes(word)) score += 50
        })
        
        // Tag matching with higher priority
        if (item.tags) {
          item.tags.forEach(tag => {
            const tagLower = tag.toLowerCase()
            if (tagLower === queryLower) score += 400
            if (tagLower.includes(queryLower)) score += 150
            queryWords.forEach(word => {
              if (tagLower.includes(word)) score += 75
            })
          })
        }
        
        // Fuzzy matching for typos and partial matches
        const titleWords = titleLower.split(' ')
        queryWords.forEach(queryWord => {
          titleWords.forEach(titleWord => {
            // Words that start with same prefix
            if (titleWord.startsWith(queryWord.substring(0, Math.min(3, queryWord.length)))) {
              score += 50
            }
            // Similar length words with character overlap
            if (Math.abs(titleWord.length - queryWord.length) <= 2) {
              let overlap = 0
              for (let i = 0; i < Math.min(titleWord.length, queryWord.length); i++) {
                if (titleWord[i] === queryWord[i]) overlap++
              }
              if (overlap >= Math.min(titleWord.length, queryWord.length) * 0.6) {
                score += 30
              }
            }
          })
        })
        
        // Add priority bonus
        score += item.priority * 5
        
        return { ...item, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8) // Increased from 6 to 8 for more results
  }, [])

  const performSearch = useCallback((searchQuery: string) => {
    const searchResults = searchFunction(searchQuery)
    setResults(searchResults)
    setSelectedIndex(0)
    
    if (searchQuery.trim()) {
      trackEvent({
        action: 'search',
        category: 'navigation',
        label: searchQuery,
        value: searchResults.length
      })
    }
  }, [searchFunction, trackEvent])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    performSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    if (query.trim()) {
      const newRecentSearches = [
        query,
        ...recentSearches.filter(s => s !== query)
      ].slice(0, 5)
      setRecentSearches(newRecentSearches)
      localStorage.setItem('portfolio-recent-searches', JSON.stringify(newRecentSearches))
    }
    
    trackEvent({
      action: 'search_result_click',
      category: 'navigation',
      label: `${result.type}:${result.title}`
    })
    
    navigate(result.url)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex])
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="w-4 h-4" />
      case 'project': return <Briefcase className="w-4 h-4" />
      case 'page': return <User className="w-4 h-4" />
      case 'skill': return <Tag className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'text-blue-600 dark:text-blue-400'
      case 'project': return 'text-green-600 dark:text-green-400'
      case 'page': return 'text-purple-600 dark:text-purple-400'
      case 'skill': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent searches:', e)
      }
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-10 xs:pt-16 sm:pt-20 px-3 xs:px-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl xs:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, articles, skills..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none text-lg"
            />
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400">
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                  <Command className="w-3 h-3" />
                </div>
                <span>+</span>
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">K</div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] xs:max-h-[60vh] sm:max-h-96 overflow-y-auto">
            {query && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">No results found</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                  Try searching for "React", "Golang", or "Projects"
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left ${
                      index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <div className={`${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                          {result.title}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)} bg-current/10 uppercase font-medium`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {result.description}
                      </p>
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {result.tags.length > 4 && (
                            <span className="text-xs text-slate-400 px-1">
                              +{result.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!query && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">Start typing to search</p>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-500">
                  <p>Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['React', 'Golang', 'Projects', 'Flutter', 'TypeScript', 'Mobile', 'Full-Stack', 'Blog', 'About'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setQuery(suggestion)
                          performSearch(suggestion)
                        }}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-500 mb-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Recent searches:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {recentSearches.map(search => (
                        <button
                          key={search}
                          onClick={() => {
                            setQuery(search)
                            performSearch(search)
                          }}
                          className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-1 text-xs"
                        >
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchBox 