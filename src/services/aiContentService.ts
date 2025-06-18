import { BlogPost } from '../schemas/blogSchema';

// AI Configuration from environment variables
const AI_CONFIG = {
  apiUrl: import.meta.env.VITE_AI_API_URL || 'https://api.hyperbolic.xyz/v1/chat/completions',
  apiKey: import.meta.env.VITE_AI_API_KEY,
  model: import.meta.env.VITE_AI_MODEL || 'meta-llama/Llama-3.3-70B-Instruct',
  maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS) || 512,
  temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE) || 0.1,
  topP: parseFloat(import.meta.env.VITE_AI_TOP_P) || 0.9,
};

// Validate that API key is available
if (!AI_CONFIG.apiKey) {
  console.warn('AI Service: VITE_AI_API_KEY not found in environment variables. AI features will use fallback methods.');
}

export interface AIGeneratedContent {
  summary: string;
  suggestedTags: string[];
  keyPoints: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ContentRecommendation {
  post: BlogPost;
  relevanceScore: number;
  reason: string;
}

class AIContentService {
  private static instance: AIContentService

  static getInstance(): AIContentService {
    if (!AIContentService.instance) {
      AIContentService.instance = new AIContentService()
    }
    return AIContentService.instance
  }

  private async callAI(prompt: string): Promise<any> {
    if (!AI_CONFIG.apiKey) {
      throw new Error('AI API key not configured');
    }

    try {
      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            { role: 'system', content: 'You are an expert content analyst and SEO specialist.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: AI_CONFIG.maxTokens,
          temperature: AI_CONFIG.temperature,
          top_p: AI_CONFIG.topP
        })
      })

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('AI API call failed:', error)
      throw error
    }
  }

  private extractFromAIResponse(response: string, key: string): string[] {
    try {
      const lines = response.split('\n')
      const startIndex = lines.findIndex(line => line.toLowerCase().includes(key.toLowerCase()))
      if (startIndex === -1) return []

      const items: string[] = []
      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line.startsWith('###') || line.startsWith('##')) break
        if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
          items.push(line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        }
      }
      return items
    } catch {
      return []
    }
  }

  private fallbackAnalysis(content: string, title: string, tags: string[]): AIGeneratedContent {
    // Simple fallback analysis when AI is not available
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
    const summary = sentences.slice(0, 3).join('. ') + '.'
    
    const words = content.toLowerCase().split(/\s+/)
    const wordFreq: Record<string, number> = {}
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
      }
    })
    
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)

    return {
      summary,
      suggestedTags: [...new Set([...tags, ...topWords])].slice(0, 8),
      keyPoints: sentences.slice(0, 5),
      seoTitle: title,
      seoDescription: summary.substring(0, 155)
    }
  }

  async generateContent(title: string, content: string, tags: string[]): Promise<AIGeneratedContent> {
    try {
      const prompt = `
        Analyze this blog post and provide the following in a structured format:

        Title: ${title}
        Content: ${content.substring(0, 2000)}...
        Current Tags: ${tags.join(', ')}

        Please provide:
        ### Summary
        A 2-3 sentence summary for SEO purposes.

        ### Suggested Tags
        - List 5-8 relevant tags (include current ones if they're good)
        - Focus on technical keywords and topics

        ### Key Points
        - List 3-5 main takeaways from the article
        - Make them actionable and specific

        ### SEO Title
        An optimized title for search engines (under 60 characters)

        ### SEO Description
        A meta description for search engines (under 155 characters)
      `

      const response = await this.callAI(prompt)
      
      const summary = response.match(/### Summary\s*\n(.*?)(?=\n###|\n$)/s)?.[1]?.trim() || ''
      const seoTitle = response.match(/### SEO Title\s*\n(.*?)(?=\n###|\n$)/s)?.[1]?.trim() || title
      const seoDescription = response.match(/### SEO Description\s*\n(.*?)(?=\n###|\n$)/s)?.[1]?.trim() || ''

      return {
        summary: summary || this.fallbackAnalysis(content, title, tags).summary,
        suggestedTags: this.extractFromAIResponse(response, 'suggested tags'),
        keyPoints: this.extractFromAIResponse(response, 'key points'),
        seoTitle,
        seoDescription
      }
    } catch (error) {
      console.warn('AI content generation failed, using fallback:', error)
      return this.fallbackAnalysis(content, title, tags)
    }
  }

  async getContentRecommendations(
    currentPost: BlogPost,
    allPosts: BlogPost[],
    maxRecommendations: number = 3
  ): Promise<ContentRecommendation[]> {
    try {
      const otherPosts = allPosts.filter(post => 
        post.title !== currentPost.title && !post.draft
      )

      if (otherPosts.length === 0) return []

      const prompt = `
        Current Post: "${currentPost.title}"
        Tags: ${currentPost.tags.join(', ')}
        Description: ${currentPost.description}

        Other Available Posts:
        ${otherPosts.map((post, index) => 
          `${index + 1}. "${post.title}" - Tags: ${post.tags.join(', ')} - ${post.description}`
        ).join('\n')}

        Please recommend the top ${Math.min(maxRecommendations, otherPosts.length)} most relevant posts and explain why each is relevant.
        Format your response as:
        ### Recommendations
        - Post: "Title" - Reason: explanation (Score: 0.0-1.0)
      `

      const response = await this.callAI(prompt)
      const recommendations: ContentRecommendation[] = []

      const recommendationMatches = response.match(/- Post: "([^"]+)" - Reason: ([^(]+) \(Score: ([\d.]+)\)/g)
      
      if (recommendationMatches) {
        for (const match of recommendationMatches.slice(0, maxRecommendations)) {
          const [, title, reason, score] = match.match(/- Post: "([^"]+)" - Reason: ([^(]+) \(Score: ([\d.]+)\)/) || []
          if (title && reason && score) {
            const post = otherPosts.find(p => p.title === title.trim())
            if (post) {
              recommendations.push({
                post,
                relevanceScore: parseFloat(score),
                reason: reason.trim()
              })
            }
          }
        }
      }

      // Fallback to tag-based recommendations if AI failed
      if (recommendations.length === 0) {
        return this.getFallbackRecommendations(currentPost, otherPosts, maxRecommendations)
      }

      return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } catch (error) {
      console.warn('AI recommendations failed, using fallback:', error)
      return this.getFallbackRecommendations(currentPost, allPosts, maxRecommendations)
    }
  }

  private getFallbackRecommendations(
    currentPost: BlogPost,
    allPosts: BlogPost[],
    maxRecommendations: number
  ): ContentRecommendation[] {
    const otherPosts = allPosts.filter(post => 
      post.title !== currentPost.title && !post.draft
    )

    const recommendations = otherPosts
      .map(post => {
        const commonTags = post.tags.filter((tag: string) => currentPost.tags.includes(tag))
        const relevanceScore = commonTags.length / Math.max(currentPost.tags.length, 1)
        
        return {
          post,
          relevanceScore,
          reason: commonTags.length > 0 
            ? `Shares ${commonTags.length} common tag${commonTags.length > 1 ? 's' : ''}: ${commonTags.join(', ')}`
            : 'Related technical content'
        }
      })
      .filter(rec => rec.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxRecommendations)

    return recommendations
  }

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  analyzeContentPerformance(posts: BlogPost[], analytics: any[]): any {
    const topTags = this.getTopPerformingTags(posts, analytics)
    const contentGaps = this.identifyContentGaps(posts)
    const suggestedTopics = this.suggestNewTopics(posts)

    return {
      topTags,
      contentGaps,
      suggestedTopics,
      totalPosts: posts.length,
      averageReadingTime: posts.reduce((acc, post) => acc + this.calculateReadingTime(post.description), 0) / posts.length
    }
  }

  private getTopPerformingTags(posts: BlogPost[], analytics: any[]): string[] {
    const tagFrequency: Record<string, number> = {}
    
    posts.forEach(post => {
      post.tags.forEach((tag: string) => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
      })
    })

    return Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
  }

  private identifyContentGaps(posts: BlogPost[]): string[] {
    const commonTechTopics = [
      'react', 'typescript', 'node.js', 'docker', 'kubernetes',
      'aws', 'microservices', 'testing', 'ci/cd', 'security'
    ]

    const existingTags = new Set(
      posts.flatMap(post => post.tags.map((tag: string) => tag.toLowerCase()))
    )

    return commonTechTopics.filter(topic => !existingTags.has(topic))
  }

  private suggestNewTopics(posts: BlogPost[]): string[] {
    const recentTrends = [
      'AI/ML Integration',
      'Edge Computing',
      'Serverless Architecture',
      'WebAssembly',
      'GraphQL',
      'Jamstack',
      'Progressive Web Apps',
      'DevOps Automation'
    ]

    return recentTrends.slice(0, 5)
  }
}

export const aiContentService = AIContentService.getInstance()

// Hook for React components
export const useAIContent = () => {
  const generateContent = async (title: string, content: string, tags: string[]) => {
    return aiContentService.generateContent(title, content, tags)
  }

  const getRecommendations = async (currentPost: BlogPost, allPosts: BlogPost[]) => {
    return aiContentService.getContentRecommendations(currentPost, allPosts)
  }

  const analyzePerformance = (posts: BlogPost[], analytics: any[]) => {
    return aiContentService.analyzeContentPerformance(posts, analytics)
  }

  // Legacy method names for backward compatibility
  const generateSummary = async (content: string, title: string) => {
    return aiContentService.generateContent(title, content, [])
  }

  const generateTags = async (content: string, existingTags: string[] = []) => {
    const result = await aiContentService.generateContent('', content, existingTags)
    return result.suggestedTags
  }

  const calculateReadingTime = (content: string) => {
    return aiContentService.calculateReadingTime(content)
  }

  return {
    generateContent,
    getRecommendations,
    analyzePerformance,
    // Legacy methods for backward compatibility
    generateSummary,
    generateTags,
    calculateReadingTime
  }
} 