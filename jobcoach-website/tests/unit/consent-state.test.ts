import { describe, it, expect, beforeEach } from 'vitest'

// Consent State Manager
class ConsentManager {
  private consents: Map<string, boolean> = new Map()
  private timestamps: Map<string, Date> = new Map()

  giveConsent(type: string): void {
    this.consents.set(type, true)
    this.timestamps.set(type, new Date())
  }

  revokeConsent(type: string): void {
    this.consents.set(type, false)
    this.timestamps.set(type, new Date())
  }

  hasConsent(type: string): boolean {
    return this.consents.get(type) || false
  }

  getConsentTimestamp(type: string): Date | undefined {
    return this.timestamps.get(type)
  }

  getAllConsents(): Record<string, boolean> {
    const result: Record<string, boolean> = {}
    this.consents.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  clearAll(): void {
    this.consents.clear()
    this.timestamps.clear()
  }
}

describe('Consent State Management', () => {
  let consentManager: ConsentManager

  beforeEach(() => {
    consentManager = new ConsentManager()
  })

  it('should start with no consents', () => {
    expect(consentManager.hasConsent('gdpr')).toBe(false)
    expect(consentManager.hasConsent('newsletter')).toBe(false)
    expect(consentManager.hasConsent('whatsapp')).toBe(false)
  })

  it('should record consent when given', () => {
    consentManager.giveConsent('gdpr')
    expect(consentManager.hasConsent('gdpr')).toBe(true)
  })

  it('should record timestamp when consent is given', () => {
    const before = new Date()
    consentManager.giveConsent('gdpr')
    const after = new Date()
    
    const timestamp = consentManager.getConsentTimestamp('gdpr')
    expect(timestamp).toBeDefined()
    expect(timestamp!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(timestamp!.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should revoke consent', () => {
    consentManager.giveConsent('newsletter')
    expect(consentManager.hasConsent('newsletter')).toBe(true)
    
    consentManager.revokeConsent('newsletter')
    expect(consentManager.hasConsent('newsletter')).toBe(false)
  })

  it('should update timestamp on revocation', () => {
    consentManager.giveConsent('newsletter')
    const firstTimestamp = consentManager.getConsentTimestamp('newsletter')
    
    // Wait a bit to ensure different timestamp
    setTimeout(() => {
      consentManager.revokeConsent('newsletter')
      const secondTimestamp = consentManager.getConsentTimestamp('newsletter')
      
      expect(secondTimestamp).toBeDefined()
      expect(secondTimestamp!.getTime()).toBeGreaterThan(firstTimestamp!.getTime())
    }, 10)
  })

  it('should handle multiple consent types', () => {
    consentManager.giveConsent('gdpr')
    consentManager.giveConsent('newsletter')
    consentManager.giveConsent('whatsapp')
    
    expect(consentManager.hasConsent('gdpr')).toBe(true)
    expect(consentManager.hasConsent('newsletter')).toBe(true)
    expect(consentManager.hasConsent('whatsapp')).toBe(true)
    
    consentManager.revokeConsent('newsletter')
    
    expect(consentManager.hasConsent('gdpr')).toBe(true)
    expect(consentManager.hasConsent('newsletter')).toBe(false)
    expect(consentManager.hasConsent('whatsapp')).toBe(true)
  })

  it('should return all consents', () => {
    consentManager.giveConsent('gdpr')
    consentManager.giveConsent('newsletter')
    consentManager.revokeConsent('whatsapp')
    
    const allConsents = consentManager.getAllConsents()
    
    expect(allConsents).toEqual({
      gdpr: true,
      newsletter: true,
      whatsapp: false,
    })
  })

  it('should clear all consents', () => {
    consentManager.giveConsent('gdpr')
    consentManager.giveConsent('newsletter')
    consentManager.giveConsent('whatsapp')
    
    consentManager.clearAll()
    
    expect(consentManager.hasConsent('gdpr')).toBe(false)
    expect(consentManager.hasConsent('newsletter')).toBe(false)
    expect(consentManager.hasConsent('whatsapp')).toBe(false)
    expect(consentManager.getAllConsents()).toEqual({})
  })
})

export { ConsentManager }