// Search Analytics Utility
export interface SearchEvent {
  query: string
  timestamp: number
  resultsCount: number
  category?: string
  filters?: Record<string, any>
  clickedResult?: {
    productId: string
    position: number
  }
}

export interface SearchAnalytics {
  totalSearches: number
  uniqueQueries: number
  avgResultsPerSearch: number
  topQueries: Array<{ query: string; count: number }>
  noResultQueries: Array<{ query: string; count: number }>
  popularCategories: Array<{ category: string; count: number }>
  searchTrends: Array<{ date: string; searches: number }>
}

class SearchAnalyticsManager {
  private storageKey = 'findora_search_analytics'
  private events: SearchEvent[] = []

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          this.events = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Error loading search analytics:', error)
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        // Keep only last 1000 events to prevent storage bloat
        const recentEvents = this.events.slice(-1000)
        localStorage.setItem(this.storageKey, JSON.stringify(recentEvents))
        this.events = recentEvents
      } catch (error) {
        console.error('Error saving search analytics:', error)
      }
    }
  }

  trackSearch(query: string, resultsCount: number, category?: string, filters?: Record<string, any>) {
    const event: SearchEvent = {
      query: query.trim().toLowerCase(),
      timestamp: Date.now(),
      resultsCount,
      category,
      filters
    }

    this.events.push(event)
    this.saveToStorage()

    // Also send to server analytics (in a real app)
    this.sendToServer(event)
  }

  trackResultClick(productId: string, position: number, query: string) {
    // Find the most recent search for this query
    const recentSearch = this.events
      .slice()
      .reverse()
      .find(event => event.query === query.trim().toLowerCase())

    if (recentSearch) {
      recentSearch.clickedResult = { productId, position }
      this.saveToStorage()
    }

    // Send click event to server
    this.sendClickToServer(productId, position, query)
  }

  getAnalytics(days = 30): SearchAnalytics {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    const recentEvents = this.events.filter(event => event.timestamp > cutoff)

    const queryCount = new Map<string, number>()
    const categoryCount = new Map<string, number>()
    const noResultQueries = new Map<string, number>()
    
    let totalResults = 0

    recentEvents.forEach(event => {
      // Count queries
      const currentCount = queryCount.get(event.query) || 0
      queryCount.set(event.query, currentCount + 1)

      // Count categories
      if (event.category) {
        const catCount = categoryCount.get(event.category) || 0
        categoryCount.set(event.category, catCount + 1)
      }

      // Track no-result queries
      if (event.resultsCount === 0) {
        const noResultCount = noResultQueries.get(event.query) || 0
        noResultQueries.set(event.query, noResultCount + 1)
      }

      totalResults += event.resultsCount
    })

    // Generate trends by day
    const trendMap = new Map<string, number>()
    recentEvents.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]
      const count = trendMap.get(date) || 0
      trendMap.set(date, count + 1)
    })

    const searchTrends = Array.from(trendMap.entries())
      .map(([date, searches]) => ({ date, searches }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalSearches: recentEvents.length,
      uniqueQueries: queryCount.size,
      avgResultsPerSearch: recentEvents.length > 0 ? totalResults / recentEvents.length : 0,
      topQueries: Array.from(queryCount.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      noResultQueries: Array.from(noResultQueries.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      popularCategories: Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      searchTrends
    }
  }

  getPopularQueries(limit = 5): string[] {
    const analytics = this.getAnalytics()
    return analytics.topQueries.slice(0, limit).map(item => item.query)
  }

  private async sendToServer(event: SearchEvent) {
    // In a real application, send to analytics service
    try {
      // await fetch('/api/analytics/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // })
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
    }
  }

  private async sendClickToServer(productId: string, position: number, query: string) {
    try {
      // await fetch('/api/analytics/click', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productId, position, query, timestamp: Date.now() })
      // })
    } catch (error) {
      // Silently fail
    }
  }

  clearAnalytics() {
    this.events = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }
}

// Export singleton instance
export const searchAnalytics = new SearchAnalyticsManager()

// Hook for React components
export function useSearchAnalytics() {
  return {
    trackSearch: searchAnalytics.trackSearch.bind(searchAnalytics),
    trackResultClick: searchAnalytics.trackResultClick.bind(searchAnalytics),
    getAnalytics: searchAnalytics.getAnalytics.bind(searchAnalytics),
    getPopularQueries: searchAnalytics.getPopularQueries.bind(searchAnalytics),
    clearAnalytics: searchAnalytics.clearAnalytics.bind(searchAnalytics)
  }
}