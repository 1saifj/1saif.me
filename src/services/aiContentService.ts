interface BlogPost {
  slug: string
  title: string
  description: string
  content: string
  tags: string[]
  createdAt: string
  readingTime: number
}

interface AIGeneratedContent {
  summary: string
  seoTitle: string
  metaDescription: string
  suggestedTags: string[]
  readingTime: number
  keyPoints: string[]
  relatedTopics: string[]
}

interface ContentRecommendation {
  slug: string
  title: string
  reason: string
  relevanceScore: number
  tags: string[]
}

class AIContentService {
  private static instance: AIContentService
  private readonly API_BASE = 'https://api.hyperbolic.xyz/v1'
  private readonly API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYWlmYWxpYWxqYW5haGlAZ21haWwuY29tIiwiaWF0IjoxNzM1NTk2OTA3fQ.mQg1gNYByw4dUH-KHdxnU_SJqTuhLHneSpETwxSKSv4'

  static getInstance(): AIContentService {
    if (!AIContentService.instance) {
      AIContentService.instance = new AIContentService()
    }
    return AIContentService.instance
  }

  // Generate comprehensive content analysis using AI
  async generateContentAnalysis(content: string, title: string): Promise<AIGeneratedContent> {
    try {
      const prompt = `
Analyze this blog post and generate:
1. A compelling 2-3 sentence summary
2. An SEO-optimized title (if different from current)
3. A meta description (150-160 characters)
4. 3-7 relevant tags
5. Estimated reading time
6. 3-5 key points
7. 3-5 related topics for further exploration

Title: ${title}
Content: ${content}

Respond in JSON format:
{
  "summary": "...",
  "seoTitle": "...",
  "metaDescription": "...",
  "suggestedTags": ["tag1", "tag2", ...],
  "readingTime": 5,
  "keyPoints": ["point1", "point2", ...],
  "relatedTopics": ["topic1", "topic2", ...]
}
`

      const response = await fetch(`${this.API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.3-70B-Instruct',
          messages: [
            { role: 'system', content: 'You are an expert content analyst and SEO specialist.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.1,
          top_p: 0.9
        })
      })

      if (!response.ok) {
        throw new Error('AI API request failed')
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      try {
        return JSON.parse(aiResponse)
      } catch {
        return this.generateLocalAnalysis(content, title)
      }

    } catch (error) {
      console.warn('AI content generation failed, using fallback:', error)
      return this.generateLocalAnalysis(content, title)
    }
  }

  // Local fallback analysis without external AI
  private generateLocalAnalysis(content: string, title: string): AIGeneratedContent {
    const words = content.split(/\s+/).length
    const readingTime = Math.ceil(words / 200) // Average reading speed

    // Extract potential tags from content
    const commonTechTerms = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Golang',
      'API', 'REST', 'GraphQL', 'Database', 'SQL', 'MongoDB', 'PostgreSQL',
      'Frontend', 'Backend', 'Fullstack', 'DevOps', 'Docker', 'Kubernetes',
      'AWS', 'Cloud', 'Microservices', 'Performance', 'Security', 'Testing',
      'Git', 'CI/CD', 'Agile', 'Scrum', 'Architecture', 'Design Patterns',
      'Machine Learning', 'AI', 'Data Science', 'Analytics', 'SEO', 'UX', 'UI'
    ]

    const suggestedTags = commonTechTerms
      .filter(term => content.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 6)

    // Generate key points from content structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
    const keyPoints = sentences
      .slice(0, 5)
      .map(sentence => sentence.trim().substring(0, 100) + '...')

    // Generate summary from first few sentences
    const summary = sentences.slice(0, 2).join('. ').substring(0, 300) + '.'

    return {
      summary,
      seoTitle: title,
      metaDescription: summary.substring(0, 155) + '...',
      suggestedTags,
      readingTime,
      keyPoints,
      relatedTopics: suggestedTags.slice(0, 4)
    }
  }

  // Generate smart content recommendations based on user reading history
  async generateRecommendations(
    currentPost: BlogPost,
    allPosts: BlogPost[],
    userReadingHistory: string[] = []
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = []

    // Filter out current post and already read posts
    const candidatePosts = allPosts.filter(post => 
      post.slug !== currentPost.slug && 
      !userReadingHistory.includes(post.slug)
    )

    for (const post of candidatePosts) {
      const relevanceScore = this.calculateRelevanceScore(currentPost, post)
      
      if (relevanceScore > 0.3) {
        const reason = this.generateRecommendationReason(currentPost, post)
        
        recommendations.push({
          slug: post.slug,
          title: post.title,
          reason,
          relevanceScore,
          tags: post.tags
        })
      }
    }

    // Sort by relevance and return top 4
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 4)
  }

  // Calculate relevance score between two posts
  private calculateRelevanceScore(currentPost: BlogPost, candidatePost: BlogPost): number {
    let score = 0

    // Tag similarity (weighted heavily)
    const commonTags = currentPost.tags.filter(tag => 
      candidatePost.tags.includes(tag)
    )
    score += (commonTags.length / Math.max(currentPost.tags.length, 1)) * 0.6

    // Title/content keyword similarity
    const currentKeywords = this.extractKeywords(currentPost.title + ' ' + currentPost.description)
    const candidateKeywords = this.extractKeywords(candidatePost.title + ' ' + candidatePost.description)
    
    const commonKeywords = currentKeywords.filter(keyword => 
      candidateKeywords.includes(keyword)
    )
    score += (commonKeywords.length / Math.max(currentKeywords.length, 1)) * 0.3

    // Recency boost (newer posts get slight preference)
    const daysDiff = Math.abs(
      new Date(currentPost.createdAt).getTime() - 
      new Date(candidatePost.createdAt).getTime()
    ) / (1000 * 60 * 60 * 24)
    
    const recencyBoost = Math.max(0, (30 - daysDiff) / 30) * 0.1
    score += recencyBoost

    return Math.min(score, 1) // Cap at 1.0
  }

  // Generate human-readable reason for recommendation
  private generateRecommendationReason(currentPost: BlogPost, recommendedPost: BlogPost): string {
    const commonTags = currentPost.tags.filter(tag => 
      recommendedPost.tags.includes(tag)
    )

    if (commonTags.length > 0) {
      const tagList = commonTags.slice(0, 2).join(' and ')
      return `Related ${tagList} content you might find interesting`
    }

    const currentKeywords = this.extractKeywords(currentPost.title)
    const recommendedKeywords = this.extractKeywords(recommendedPost.title)
    const commonKeywords = currentKeywords.filter(keyword => 
      recommendedKeywords.includes(keyword)
    )

    if (commonKeywords.length > 0) {
      return `Similar topic: ${commonKeywords[0]}`
    }

    return 'Based on your reading interests'
  }

  // Extract keywords from text
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'how', 'what', 'when', 'where', 'why', 'who',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had'
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10)
  }

  // Auto-generate SEO-friendly tags from content
  async generateSmartTags(content: string, existingTags: string[] = []): Promise<string[]> {
    try {
      const analysis = await this.generateContentAnalysis(content, '')
      
      // Combine AI suggestions with existing tags
      const allTags = [...new Set([...existingTags, ...analysis.suggestedTags])]
      
      // Return top 8 most relevant tags
      return allTags.slice(0, 8)
    } catch (error) {
      console.warn('Smart tag generation failed:', error)
      return existingTags
    }
  }

  // Generate reading time estimation
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    const readingTime = Math.ceil(words / wordsPerMinute)
    return Math.max(1, readingTime) // Minimum 1 minute
  }

  // Generate content insights for analytics
  analyzeContentPerformance(posts: BlogPost[], analytics: any[]): any {
    const insights = {
      topPerformingTags: this.getTopPerformingTags(posts, analytics),
      contentGaps: this.identifyContentGaps(posts),
      recommendedTopics: this.suggestNewTopics(posts),
      averageEngagement: this.calculateAverageEngagement(analytics)
    }

    return insights
  }

  private getTopPerformingTags(posts: BlogPost[], analytics: any[]): string[] {
    // Implementation for tag performance analysis
    const tagEngagement: { [key: string]: number } = {}
    
    posts.forEach(post => {
      const postAnalytics = analytics.find(a => a.slug === post.slug)
      const engagement = postAnalytics?.engagement || 0
      
      post.tags.forEach(tag => {
        tagEngagement[tag] = (tagEngagement[tag] || 0) + engagement
      })
    })

    return Object.entries(tagEngagement)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
  }

  private identifyContentGaps(posts: BlogPost[]): string[] {
    // Analyze existing content to identify gaps
    const existingTopics = new Set(posts.flatMap(post => post.tags))
    
    const suggestedTopics = [
      'Web Performance', 'Security Best Practices', 'Testing Strategies',
      'Code Review', 'Architecture Patterns', 'DevOps Practices',
      'Mobile Development', 'API Design', 'Database Optimization',
      'User Experience', 'Accessibility', 'Progressive Web Apps'
    ]

    return suggestedTopics.filter(topic => !existingTopics.has(topic))
  }

  private suggestNewTopics(posts: BlogPost[]): string[] {
    // AI-powered topic suggestions based on existing content
    const recentTrends = [
      'AI/ML Integration', 'Serverless Architecture', 'Edge Computing',
      'Web3 Development', 'Sustainable Software', 'Remote Team Collaboration'
    ]

    return recentTrends.slice(0, 5)
  }

  private calculateAverageEngagement(analytics: any[]): number {
    if (analytics.length === 0) return 0
    
    const totalEngagement = analytics.reduce((sum, item) => sum + (item.engagement || 0), 0)
    return totalEngagement / analytics.length
  }
}

export default AIContentService

// React Hook for easy integration
export const useAIContent = () => {
  const aiService = AIContentService.getInstance()

  const generateSummary = async (content: string, title: string) => {
    return await aiService.generateContentAnalysis(content, title)
  }

  const getRecommendations = async (currentPost: BlogPost, allPosts: BlogPost[]) => {
    const history = JSON.parse(localStorage.getItem('readingHistory') || '[]')
    return await aiService.generateRecommendations(currentPost, allPosts, history)
  }

  const generateTags = async (content: string, existingTags: string[] = []) => {
    return await aiService.generateSmartTags(content, existingTags)
  }

  const trackReading = (slug: string) => {
    const history = JSON.parse(localStorage.getItem('readingHistory') || '[]')
    if (!history.includes(slug)) {
      history.push(slug)
      localStorage.setItem('readingHistory', JSON.stringify(history.slice(-50))) // Keep last 50
    }
  }

  return {
    generateSummary,
    getRecommendations,
    generateTags,
    trackReading,
    calculateReadingTime: aiService.calculateReadingTime.bind(aiService)
  }
} 