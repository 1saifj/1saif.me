import React, { useEffect, useRef } from 'react'

interface SocialImageGeneratorProps {
  title: string
  author: string
  tags?: string[]
  publishedDate?: string
  readingTime?: number
  onImageGenerated?: (imageUrl: string) => void
}

export const SocialImageGenerator: React.FC<SocialImageGeneratorProps> = ({
  title,
  author,
  tags = [],
  publishedDate,
  readingTime,
  onImageGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateImage = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size for optimal social media sharing (1200x630)
      canvas.width = 1200
      canvas.height = 630

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#1e40af') // Blue-700
      gradient.addColorStop(0.5, '#3b82f6') // Blue-500
      gradient.addColorStop(1, '#60a5fa') // Blue-400

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add subtle pattern overlay
      ctx.globalAlpha = 0.1
      for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(i, j, 20, 20)
        }
      }
      ctx.globalAlpha = 1

      // Add main content area with semi-transparent background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.roundRect(60, 60, canvas.width - 120, canvas.height - 120, 20)
      ctx.fill()

      // Helper function for text wrapping
      const wrapText = (text: string, maxWidth: number, fontSize: number, fontWeight: string = 'normal') => {
        ctx.font = `${fontWeight} ${fontSize}px "Inter", system-ui, -apple-system, sans-serif`
        const words = text.split(' ')
        const lines = []
        let currentLine = words[0]

        for (let i = 1; i < words.length; i++) {
          const word = words[i]
          const width = ctx.measureText(currentLine + ' ' + word).width
          if (width < maxWidth) {
            currentLine += ' ' + word
          } else {
            lines.push(currentLine)
            currentLine = word
          }
        }
        lines.push(currentLine)
        return lines
      }

      // Title
      ctx.fillStyle = '#1f2937' // Gray-800
      const titleLines = wrapText(title, canvas.width - 200, 48, 'bold')
      titleLines.forEach((line, index) => {
        ctx.font = 'bold 48px "Inter", system-ui, -apple-system, sans-serif'
        ctx.fillText(line, 100, 180 + (index * 60))
      })

      // Author
      ctx.fillStyle = '#4b5563' // Gray-600
      ctx.font = '24px "Inter", system-ui, -apple-system, sans-serif'
      const authorY = 180 + (titleLines.length * 60) + 40
      ctx.fillText(`By ${author}`, 100, authorY)

      // Tags
      if (tags.length > 0) {
        const tagsY = authorY + 50
        ctx.fillStyle = '#6366f1' // Indigo-500
        ctx.font = '18px "Inter", system-ui, -apple-system, sans-serif'
        
        let tagX = 100
        tags.slice(0, 4).forEach((tag, index) => {
          const tagText = `#${tag}`
          const tagWidth = ctx.measureText(tagText).width
          
          if (tagX + tagWidth < canvas.width - 100) {
            ctx.fillText(tagText, tagX, tagsY)
            tagX += tagWidth + 30
          }
        })
      }

      // Reading time and date at the bottom
      if (readingTime || publishedDate) {
        ctx.fillStyle = '#6b7280' // Gray-500
        ctx.font = '16px "Inter", system-ui, -apple-system, sans-serif'
        
        const bottomY = canvas.height - 120
        let bottomText = ''
        
        if (readingTime) {
          bottomText += `${readingTime} min read`
        }
        
        if (publishedDate && readingTime) {
          bottomText += ' • '
        }
        
        if (publishedDate) {
          const date = new Date(publishedDate)
          bottomText += date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        }
        
        ctx.fillText(bottomText, 100, bottomY)
      }

      // Logo/branding in bottom right
      ctx.fillStyle = '#1e40af'
      ctx.font = 'bold 24px "Inter", system-ui, -apple-system, sans-serif'
      const brandText = '1saif.me'
      const brandWidth = ctx.measureText(brandText).width
      ctx.fillText(brandText, canvas.width - brandWidth - 100, canvas.height - 120)

      // Convert canvas to blob and create URL
      canvas.toBlob((blob) => {
        if (blob && onImageGenerated) {
          const imageUrl = URL.createObjectURL(blob)
          onImageGenerated(imageUrl)
        }
      }, 'image/png', 0.95)
    }

    generateImage()
  }, [title, author, tags, publishedDate, readingTime, onImageGenerated])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  )
}

// Utility function to generate social image URL for a blog post
export const generateSocialImageUrl = async (
  title: string,
  author: string,
  options: {
    tags?: string[]
    publishedDate?: string
    readingTime?: number
  } = {}
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      resolve('/sj_image.jpeg') // Fallback
      return
    }

    // Set canvas size
    canvas.width = 1200
    canvas.height = 630

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1e40af')
    gradient.addColorStop(0.5, '#3b82f6')
    gradient.addColorStop(1, '#60a5fa')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add content background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.roundRect(60, 60, canvas.width - 120, canvas.height - 120, 20)
    ctx.fill()

    // Add title
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 48px "Inter", system-ui, -apple-system, sans-serif'
    
    // Simple text wrapping
    const words = title.split(' ')
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + ' ' + word).width
      if (width < canvas.width - 200) {
        currentLine += ' ' + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)

    lines.forEach((line, index) => {
      ctx.fillText(line, 100, 180 + (index * 60))
    })

    // Add author
    ctx.fillStyle = '#4b5563'
    ctx.font = '24px "Inter", system-ui, -apple-system, sans-serif'
    const authorY = 180 + (lines.length * 60) + 40
    ctx.fillText(`By ${author}`, 100, authorY)

    // Add branding
    ctx.fillStyle = '#1e40af'
    ctx.font = 'bold 24px "Inter", system-ui, -apple-system, sans-serif'
    const brandText = '1saif.me'
    const brandWidth = ctx.measureText(brandText).width
    ctx.fillText(brandText, canvas.width - brandWidth - 100, canvas.height - 120)

    // Convert to data URL
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob)
        resolve(imageUrl)
      } else {
        resolve('/sj_image.jpeg')
      }
    }, 'image/png', 0.95)
  })
}

export default SocialImageGenerator 