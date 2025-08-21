import { describe, it, expect } from 'vitest'
import * as z from 'zod'

// ALG Form Schema
const algSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().min(10, 'Ungültige Telefonnummer'),
  dateOfBirth: z.string().min(1, 'Geburtsdatum erforderlich'),
  street: z.string().min(3, 'Straße erforderlich'),
  houseNumber: z.string().min(1, 'Hausnummer erforderlich'),
  postalCode: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  city: z.string().min(2, 'Stadt erforderlich'),
  lastEmployer: z.string().min(2, 'Letzter Arbeitgeber erforderlich'),
  employmentEnd: z.string().min(1, 'Ende des Arbeitsverhältnisses erforderlich'),
  reasonForTermination: z.string().min(10, 'Bitte Kündigungsgrund angeben'),
  monthlyIncome: z.string().min(1, 'Monatseinkommen erforderlich'),
  iban: z.string().regex(/^DE\d{20}$/, 'Ungültige IBAN'),
  bic: z.string().min(8, 'Ungültiger BIC').max(11),
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: 'Datenschutzerklärung muss akzeptiert werden',
  }),
  newsletterConsent: z.boolean().optional(),
})

describe('Form Validation', () => {
  describe('ALG Form', () => {
    it('should validate correct data', () => {
      const validData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '+49123456789',
        dateOfBirth: '1990-01-01',
        street: 'Musterstraße',
        houseNumber: '123',
        postalCode: '12345',
        city: 'Berlin',
        lastEmployer: 'Musterfirma GmbH',
        employmentEnd: '2024-01-01',
        reasonForTermination: 'Betriebsbedingte Kündigung',
        monthlyIncome: '3000',
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
        gdprConsent: true,
        newsletterConsent: false,
      }

      const result = algSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'invalid-email',
        phone: '+49123456789',
        dateOfBirth: '1990-01-01',
        street: 'Musterstraße',
        houseNumber: '123',
        postalCode: '12345',
        city: 'Berlin',
        lastEmployer: 'Musterfirma GmbH',
        employmentEnd: '2024-01-01',
        reasonForTermination: 'Betriebsbedingte Kündigung',
        monthlyIncome: '3000',
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
        gdprConsent: true,
      }

      const result = algSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Ungültige E-Mail-Adresse')
      }
    })

    it('should reject invalid IBAN', () => {
      const invalidData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '+49123456789',
        dateOfBirth: '1990-01-01',
        street: 'Musterstraße',
        houseNumber: '123',
        postalCode: '12345',
        city: 'Berlin',
        lastEmployer: 'Musterfirma GmbH',
        employmentEnd: '2024-01-01',
        reasonForTermination: 'Betriebsbedingte Kündigung',
        monthlyIncome: '3000',
        iban: 'INVALID',
        bic: 'COBADEFFXXX',
        gdprConsent: true,
      }

      const result = algSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Ungültige IBAN')
      }
    })

    it('should require GDPR consent', () => {
      const invalidData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '+49123456789',
        dateOfBirth: '1990-01-01',
        street: 'Musterstraße',
        houseNumber: '123',
        postalCode: '12345',
        city: 'Berlin',
        lastEmployer: 'Musterfirma GmbH',
        employmentEnd: '2024-01-01',
        reasonForTermination: 'Betriebsbedingte Kündigung',
        monthlyIncome: '3000',
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
        gdprConsent: false,
      }

      const result = algSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Datenschutzerklärung muss akzeptiert werden')
      }
    })

    it('should validate postal code format', () => {
      const invalidData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '+49123456789',
        dateOfBirth: '1990-01-01',
        street: 'Musterstraße',
        houseNumber: '123',
        postalCode: '1234', // Too short
        city: 'Berlin',
        lastEmployer: 'Musterfirma GmbH',
        employmentEnd: '2024-01-01',
        reasonForTermination: 'Betriebsbedingte Kündigung',
        monthlyIncome: '3000',
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
        gdprConsent: true,
      }

      const result = algSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('PLZ muss 5 Ziffern haben')
      }
    })
  })
})