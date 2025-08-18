// Product SEO Optimization Tools
export interface SEOAnalysis {
  score: number
  maxScore: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  issues: SEOIssue[]
  improvements: SEOImprovement[]
  keywords: KeywordAnalysis
  titleAnalysis: TitleAnalysis
  descriptionAnalysis: DescriptionAnalysis
  categoryAlignment: CategoryAlignment
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info'
  category: 'title' | 'description' | 'keywords' | 'images' | 'pricing' | 'category'
  issue: string
  impact: number
  solution: string
}

export interface SEOImprovement {
  category: 'title' | 'description' | 'keywords' | 'images' | 'tags'
  suggestion: string
  expectedImpact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface KeywordAnalysis {
  primary: string[]
  secondary: string[]
  missing: string[]
  suggestions: KeywordSuggestion[]
  density: { keyword: string; count: number; density: number }[]
}

export interface KeywordSuggestion {
  keyword: string
  relevance: number
  competition: 'low' | 'medium' | 'high'
  searchVolume: 'low' | 'medium' | 'high'
  difficulty: number
  suggested: boolean
}

export interface TitleAnalysis {
  length: number
  optimalLength: { min: number; max: number }
  hasKeywords: boolean
  readability: number
  suggestions: string[]
  score: number
}

export interface DescriptionAnalysis {
  length: number
  optimalLength: { min: number; max: number }
  hasKeywords: boolean
  readability: number
  callToAction: boolean
  suggestions: string[]
  score: number
}

export interface CategoryAlignment {
  isOptimal: boolean
  suggestedCategories: string[]
  confidenceScore: number
  reasoning: string
}

export interface ProductData {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  tags: string[]
  category?: {
    id: string
    name: string
    slug: string
  }
  images: { id: string; url: string; altText?: string }[]
  metaTitle?: string
  metaDescription?: string
}

class SEOOptimizer {
  // Common product keywords by category
  private categoryKeywords = {
    electronics: ['tech', 'digital', 'electronic', 'wireless', 'smart', 'portable', 'device'],
    fashion: ['style', 'trendy', 'comfortable', 'quality', 'designer', 'premium', 'classic'],
    home: ['home', 'decor', 'comfortable', 'modern', 'elegant', 'durable', 'functional'],
    health: ['natural', 'healthy', 'organic', 'safe', 'effective', 'wellness', 'care'],
    sports: ['performance', 'durable', 'professional', 'training', 'fitness', 'sport', 'active'],
    books: ['educational', 'informative', 'bestseller', 'popular', 'comprehensive', 'guide'],
    toys: ['fun', 'educational', 'safe', 'creative', 'entertaining', 'kids', 'children'],
    automotive: ['reliable', 'quality', 'performance', 'durable', 'professional', 'auto'],
    food: ['fresh', 'natural', 'delicious', 'healthy', 'organic', 'gourmet', 'quality'],
    art: ['creative', 'unique', 'handmade', 'artistic', 'beautiful', 'original', 'craft']
  }

  // Stop words to exclude from keyword analysis
  private stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'this', 'these', 'those',
    'they', 'them', 'their', 'there', 'then', 'than', 'or', 'but'
  ])

  analyzeProduct(product: ProductData): SEOAnalysis {
    const titleAnalysis = this.analyzeTitleSEO(product.name)
    const descriptionAnalysis = this.analyzeDescriptionSEO(product.description)
    const keywordAnalysis = this.analyzeKeywords(product)
    const categoryAlignment = this.analyzeCategoryAlignment(product)
    const issues = this.identifyIssues(product, titleAnalysis, descriptionAnalysis, keywordAnalysis)
    const improvements = this.generateImprovements(product, titleAnalysis, descriptionAnalysis, keywordAnalysis)

    // Calculate overall SEO score
    const score = this.calculateSEOScore(titleAnalysis, descriptionAnalysis, keywordAnalysis, issues)
    const maxScore = 100
    const grade = this.calculateGrade(score)

    return {
      score,
      maxScore,
      grade,
      issues,
      improvements,
      keywords: keywordAnalysis,
      titleAnalysis,
      descriptionAnalysis,
      categoryAlignment
    }
  }

  private analyzeTitleSEO(title: string): TitleAnalysis {
    const length = title.length
    const optimalLength = { min: 30, max: 60 }
    const words = this.extractWords(title)
    
    // Check for important keywords
    const hasKeywords = words.some(word => 
      word.length > 3 && !this.stopWords.has(word.toLowerCase())
    )

    // Simple readability score (based on word count and average word length)
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
    const readability = Math.max(0, 100 - (avgWordLength - 5) * 10 - Math.abs(words.length - 6) * 5)

    const suggestions = []
    if (length < optimalLength.min) suggestions.push('Title is too short - add more descriptive keywords')
    if (length > optimalLength.max) suggestions.push('Title is too long - consider shortening for better visibility')
    if (!hasKeywords) suggestions.push('Include relevant keywords that customers might search for')
    if (words.length < 3) suggestions.push('Add more descriptive words to improve searchability')

    const score = this.calculateTitleScore(length, optimalLength, hasKeywords, readability)

    return {
      length,
      optimalLength,
      hasKeywords,
      readability,
      suggestions,
      score
    }
  }

  private analyzeDescriptionSEO(description: string): DescriptionAnalysis {
    const length = description.length
    const optimalLength = { min: 120, max: 300 }
    const words = this.extractWords(description)
    
    const hasKeywords = words.some(word => 
      word.length > 3 && !this.stopWords.has(word.toLowerCase())
    )

    const callToActionWords = ['buy', 'order', 'purchase', 'get', 'shop', 'discover', 'explore']
    const callToAction = callToActionWords.some(cta => 
      description.toLowerCase().includes(cta)
    )

    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
    const readability = Math.max(0, 100 - (avgWordLength - 5) * 8 - Math.abs(words.length - 25) * 2)

    const suggestions = []
    if (length < optimalLength.min) suggestions.push('Description is too short - add more details about features and benefits')
    if (length > optimalLength.max) suggestions.push('Description is too long - focus on key selling points')
    if (!hasKeywords) suggestions.push('Include relevant keywords naturally in the description')
    if (!callToAction) suggestions.push('Add a call-to-action to encourage purchases')
    if (readability < 60) suggestions.push('Simplify language for better readability')

    const score = this.calculateDescriptionScore(length, optimalLength, hasKeywords, callToAction, readability)

    return {
      length,
      optimalLength,
      hasKeywords,
      readability,
      callToAction,
      suggestions,
      score
    }
  }

  private analyzeKeywords(product: ProductData): KeywordAnalysis {
    const text = `${product.name} ${product.description} ${product.tags?.join(' ') || ''}`.toLowerCase()
    const words = this.extractWords(text)
    
    // Calculate keyword frequency
    const wordCount = new Map<string, number>()
    words.forEach(word => {
      if (word.length > 2 && !this.stopWords.has(word)) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1)
      }
    })

    // Extract primary keywords (most frequent)
    const sortedWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const primary = sortedWords.slice(0, 5).map(([word]) => word)
    const secondary = sortedWords.slice(5, 10).map(([word]) => word)

    // Calculate keyword density
    const totalWords = words.length
    const density = sortedWords.map(([keyword, count]) => ({
      keyword,
      count,
      density: (count / totalWords) * 100
    }))

    // Generate keyword suggestions based on category
    const categoryKey = product.category?.name.toLowerCase() as keyof typeof this.categoryKeywords
    const categoryKeywords = this.categoryKeywords[categoryKey] || []
    
    const missing = categoryKeywords.filter(keyword => 
      !text.includes(keyword.toLowerCase())
    )

    const suggestions = this.generateKeywordSuggestions(product, primary, secondary)

    return {
      primary,
      secondary,
      missing,
      suggestions,
      density: density.slice(0, 10)
    }
  }

  private generateKeywordSuggestions(product: ProductData, primary: string[], secondary: string[]): KeywordSuggestion[] {
    const existing = new Set([...primary, ...secondary])
    const suggestions: KeywordSuggestion[] = []

    // Category-based suggestions
    const categoryKey = product.category?.name.toLowerCase() as keyof typeof this.categoryKeywords
    const categoryKeywords = this.categoryKeywords[categoryKey] || []

    categoryKeywords.forEach(keyword => {
      if (!existing.has(keyword)) {
        suggestions.push({
          keyword,
          relevance: 0.8,
          competition: 'medium',
          searchVolume: 'medium',
          difficulty: 3,
          suggested: true
        })
      }
    })

    // Price-based suggestions
    if (product.price < 50) {
      suggestions.push({
        keyword: 'affordable',
        relevance: 0.7,
        competition: 'high',
        searchVolume: 'high',
        difficulty: 4,
        suggested: true
      })
    } else if (product.price > 100) {
      suggestions.push({
        keyword: 'premium',
        relevance: 0.7,
        competition: 'medium',
        searchVolume: 'medium',
        difficulty: 3,
        suggested: true
      })
    }

    // Quality indicators
    const qualityKeywords = ['best', 'top', 'quality', 'professional', 'durable']
    qualityKeywords.forEach(keyword => {
      if (!existing.has(keyword)) {
        suggestions.push({
          keyword,
          relevance: 0.6,
          competition: 'high',
          searchVolume: 'high',
          difficulty: 5,
          suggested: false
        })
      }
    })

    return suggestions.slice(0, 15)
  }

  private analyzeCategoryAlignment(product: ProductData): CategoryAlignment {
    const text = `${product.name} ${product.description}`.toLowerCase()
    const words = this.extractWords(text)
    
    let bestMatch = ''
    let highestScore = 0

    // Check alignment with each category
    Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
      const matchCount = keywords.filter(keyword => 
        words.includes(keyword) || text.includes(keyword)
      ).length
      
      const score = matchCount / keywords.length
      if (score > highestScore) {
        highestScore = score
        bestMatch = category
      }
    })

    const currentCategory = product.category?.name.toLowerCase() || ''
    const isOptimal = currentCategory === bestMatch && highestScore > 0.3

    const suggestedCategories = Object.keys(this.categoryKeywords)
      .filter(cat => cat !== currentCategory)
      .slice(0, 3)

    return {
      isOptimal,
      suggestedCategories,
      confidenceScore: highestScore * 100,
      reasoning: `Product content has ${(highestScore * 100).toFixed(1)}% alignment with ${bestMatch} category`
    }
  }

  private identifyIssues(
    product: ProductData, 
    titleAnalysis: TitleAnalysis, 
    descriptionAnalysis: DescriptionAnalysis,
    keywordAnalysis: KeywordAnalysis
  ): SEOIssue[] {
    const issues: SEOIssue[] = []

    // Title issues
    if (titleAnalysis.length < 30) {
      issues.push({
        type: 'critical',
        category: 'title',
        issue: 'Title too short',
        impact: 20,
        solution: 'Expand title to 30-60 characters with relevant keywords'
      })
    }

    if (titleAnalysis.length > 60) {
      issues.push({
        type: 'warning',
        category: 'title',
        issue: 'Title too long',
        impact: 15,
        solution: 'Shorten title to under 60 characters for better visibility'
      })
    }

    // Description issues
    if (descriptionAnalysis.length < 120) {
      issues.push({
        type: 'critical',
        category: 'description',
        issue: 'Description too brief',
        impact: 25,
        solution: 'Add more details about product features, benefits, and usage'
      })
    }

    if (!descriptionAnalysis.callToAction) {
      issues.push({
        type: 'warning',
        category: 'description',
        issue: 'Missing call-to-action',
        impact: 10,
        solution: 'Add encouraging phrases like "Order now" or "Get yours today"'
      })
    }

    // Image issues
    if (product.images.length === 0) {
      issues.push({
        type: 'critical',
        category: 'images',
        issue: 'No product images',
        impact: 30,
        solution: 'Add at least 3-5 high-quality product images'
      })
    } else if (product.images.length < 3) {
      issues.push({
        type: 'warning',
        category: 'images',
        issue: 'Few product images',
        impact: 15,
        solution: 'Add more images showing different angles and usage scenarios'
      })
    }

    // Keyword issues
    if (keywordAnalysis.primary.length < 3) {
      issues.push({
        type: 'warning',
        category: 'keywords',
        issue: 'Limited keyword variety',
        impact: 12,
        solution: 'Include more relevant keywords in title and description'
      })
    }

    // Pricing issues
    if (!product.compareAtPrice && product.price > 50) {
      issues.push({
        type: 'info',
        category: 'pricing',
        issue: 'No compare price set',
        impact: 5,
        solution: 'Consider setting a compare-at price to show value'
      })
    }

    return issues
  }

  private generateImprovements(
    product: ProductData,
    titleAnalysis: TitleAnalysis,
    descriptionAnalysis: DescriptionAnalysis,
    keywordAnalysis: KeywordAnalysis
  ): SEOImprovement[] {
    const improvements: SEOImprovement[] = []

    // Title improvements
    if (titleAnalysis.score < 80) {
      improvements.push({
        category: 'title',
        suggestion: 'Include primary keywords at the beginning of the title',
        expectedImpact: 'high',
        difficulty: 'easy'
      })
    }

    // Description improvements
    if (descriptionAnalysis.score < 70) {
      improvements.push({
        category: 'description',
        suggestion: 'Add bullet points highlighting key features and benefits',
        expectedImpact: 'medium',
        difficulty: 'easy'
      })
    }

    // Keyword improvements
    if (keywordAnalysis.missing.length > 0) {
      improvements.push({
        category: 'keywords',
        suggestion: `Consider adding these relevant keywords: ${keywordAnalysis.missing.slice(0, 3).join(', ')}`,
        expectedImpact: 'high',
        difficulty: 'medium'
      })
    }

    // Tag improvements
    if (!product.tags || product.tags.length < 5) {
      improvements.push({
        category: 'tags',
        suggestion: 'Add more specific tags to improve product discoverability',
        expectedImpact: 'medium',
        difficulty: 'easy'
      })
    }

    // Image improvements
    const imagesWithoutAlt = product.images.filter(img => !img.altText)
    if (imagesWithoutAlt.length > 0) {
      improvements.push({
        category: 'images',
        suggestion: 'Add descriptive alt text to all product images for better SEO',
        expectedImpact: 'medium',
        difficulty: 'easy'
      })
    }

    return improvements
  }

  private calculateSEOScore(
    titleAnalysis: TitleAnalysis,
    descriptionAnalysis: DescriptionAnalysis,
    keywordAnalysis: KeywordAnalysis,
    issues: SEOIssue[]
  ): number {
    let score = 0

    // Title score (30% weight)
    score += titleAnalysis.score * 0.3

    // Description score (25% weight)
    score += descriptionAnalysis.score * 0.25

    // Keyword score (25% weight)
    const keywordScore = Math.min(100, keywordAnalysis.primary.length * 15 + keywordAnalysis.secondary.length * 5)
    score += keywordScore * 0.25

    // Deduct points for issues (20% weight)
    const totalImpact = issues.reduce((sum, issue) => sum + issue.impact, 0)
    const issueDeduction = Math.min(20, totalImpact)
    score += (20 - issueDeduction)

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+'
    if (score >= 90) return 'A'
    if (score >= 85) return 'B+'
    if (score >= 80) return 'B'
    if (score >= 75) return 'C+'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  private calculateTitleScore(
    length: number, 
    optimal: { min: number; max: number }, 
    hasKeywords: boolean, 
    readability: number
  ): number {
    let score = 0

    // Length score (40%)
    if (length >= optimal.min && length <= optimal.max) {
      score += 40
    } else {
      const deviation = Math.min(Math.abs(length - optimal.min), Math.abs(length - optimal.max))
      score += Math.max(0, 40 - deviation * 2)
    }

    // Keywords score (35%)
    score += hasKeywords ? 35 : 0

    // Readability score (25%)
    score += (readability / 100) * 25

    return Math.round(score)
  }

  private calculateDescriptionScore(
    length: number,
    optimal: { min: number; max: number },
    hasKeywords: boolean,
    callToAction: boolean,
    readability: number
  ): number {
    let score = 0

    // Length score (30%)
    if (length >= optimal.min && length <= optimal.max) {
      score += 30
    } else {
      const deviation = Math.min(Math.abs(length - optimal.min), Math.abs(length - optimal.max))
      score += Math.max(0, 30 - deviation * 0.5)
    }

    // Keywords score (30%)
    score += hasKeywords ? 30 : 0

    // Call to action (20%)
    score += callToAction ? 20 : 0

    // Readability score (20%)
    score += (readability / 100) * 20

    return Math.round(score)
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
  }

  // Generate optimized title suggestions
  generateTitleSuggestions(product: ProductData): string[] {
    const keywords = this.analyzeKeywords(product)
    const primaryKeywords = keywords.primary.slice(0, 3)
    const categoryKey = product.category?.name.toLowerCase() as keyof typeof this.categoryKeywords
    const categoryKeywords = this.categoryKeywords[categoryKey] || []

    const suggestions = []

    // Keyword-first approach
    if (primaryKeywords.length > 0) {
      suggestions.push(`${primaryKeywords[0]} - ${product.name}`)
      suggestions.push(`${primaryKeywords.join(' ')} | Premium Quality`)
    }

    // Category-focused approach
    if (categoryKeywords.length > 0) {
      suggestions.push(`${categoryKeywords[0]} ${product.name}`)
      suggestions.push(`Premium ${categoryKeywords[0]} - ${product.name}`)
    }

    // Value proposition approach
    const valueProps = ['Best', 'Top Quality', 'Premium', 'Professional', 'High Performance']
    suggestions.push(`${valueProps[0]} ${product.name}`)

    return suggestions.slice(0, 5)
  }

  // Generate optimized description suggestions
  generateDescriptionSuggestions(product: ProductData): string[] {
    const keywords = this.analyzeKeywords(product)
    const suggestions = []

    // Feature-focused template
    suggestions.push(
      `Discover our premium ${product.name} with exceptional quality and performance. ` +
      `Perfect for ${product.category?.name.toLowerCase() || 'everyday use'}, this product offers ` +
      `outstanding value and reliability. Shop now for the best deals!`
    )

    // Benefit-focused template
    suggestions.push(
      `Transform your experience with our high-quality ${product.name}. ` +
      `Designed for ${keywords.primary.slice(0, 2).join(' and ')}, this product delivers ` +
      `exceptional results every time. Order today and discover the difference!`
    )

    return suggestions.slice(0, 3)
  }
}

// Export singleton instance
export const seoOptimizer = new SEOOptimizer()

// Hook for React components
export function useSEOTools() {
  return {
    analyzeProduct: seoOptimizer.analyzeProduct.bind(seoOptimizer),
    generateTitleSuggestions: seoOptimizer.generateTitleSuggestions.bind(seoOptimizer),
    generateDescriptionSuggestions: seoOptimizer.generateDescriptionSuggestions.bind(seoOptimizer)
  }
}