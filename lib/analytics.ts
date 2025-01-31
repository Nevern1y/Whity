type AnalyticsEvent = {
  name: string
  properties?: Record<string, any>
}

export const analytics = {
  track: async (event: AnalyticsEvent) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  },
} 