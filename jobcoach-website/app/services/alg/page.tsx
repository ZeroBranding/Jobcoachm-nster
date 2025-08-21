'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SignaturePad from '@/components/SignaturePad'
import { submitApplication } from '@/lib/api'

const algSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().min(10, 'Ungültige Telefonnummer'),
  dateOfBirth: z.string().min(1, 'Geburtsdatum erforderlich'),
  
  // Address
  street: z.string().min(3, 'Straße erforderlich'),
  houseNumber: z.string().min(1, 'Hausnummer erforderlich'),
  postalCode: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  city: z.string().min(2, 'Stadt erforderlich'),
  
  // Employment Information
  lastEmployer: z.string().min(2, 'Letzter Arbeitgeber erforderlich'),
  employmentEnd: z.string().min(1, 'Ende des Arbeitsverhältnisses erforderlich'),
  reasonForTermination: z.string().min(10, 'Bitte Kündigungsgrund angeben'),
  monthlyIncome: z.string().min(1, 'Monatseinkommen erforderlich'),
  
  // Bank Information
  iban: z.string().regex(/^DE\d{20}$/, 'Ungültige IBAN'),
  bic: z.string().min(8, 'Ungültiger BIC').max(11),
  
  // GDPR
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: 'Datenschutzerklärung muss akzeptiert werden',
  }),
  newsletterConsent: z.boolean().optional(),
})

type ALGFormData = z.infer<typeof algSchema>

export default function ALGPage() {
  const [signature, setSignature] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ALGFormData>({
    resolver: zodResolver(algSchema),
  })

  const onSubmit = async (data: ALGFormData) => {
    if (!signature) {
      toast.error('Bitte unterschreiben Sie das Formular')
      return
    }

    setIsSubmitting(true)
    try {
      const applicationData = {
        type: 'ALG' as const,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: new Date(data.dateOfBirth),
        address: `${data.street} ${data.houseNumber}`,
        city: data.city,
        postalCode: data.postalCode,
        formData: data,
        signature,
        gdprConsent: data.gdprConsent,
      }

      await submitApplication(applicationData)
      toast.success('Antrag erfolgreich eingereicht!')
      reset()
      setSignature('')
    } catch (error) {
      toast.error('Fehler beim Einreichen des Antrags')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Arbeitslosengeld beantragen</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Füllen Sie das Formular vollständig aus. Alle Angaben werden vertraulich behandelt.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Persönliche Angaben</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Vorname *</label>
                  <input {...register('firstName')} className="form-input" />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Nachname *</label>
                  <input {...register('lastName')} className="form-input" />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">E-Mail *</label>
                  <input {...register('email')} type="email" className="form-input" />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Telefon *</label>
                  <input {...register('phone')} type="tel" className="form-input" />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Geburtsdatum *</label>
                  <input {...register('dateOfBirth')} type="date" className="form-input" />
                  {errors.dateOfBirth && (
                    <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Adresse</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Straße *</label>
                  <input {...register('street')} className="form-input" />
                  {errors.street && (
                    <p className="text-red-400 text-sm mt-1">{errors.street.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Hausnummer *</label>
                  <input {...register('houseNumber')} className="form-input" />
                  {errors.houseNumber && (
                    <p className="text-red-400 text-sm mt-1">{errors.houseNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">PLZ *</label>
                  <input {...register('postalCode')} className="form-input" />
                  {errors.postalCode && (
                    <p className="text-red-400 text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Stadt *</label>
                  <input {...register('city')} className="form-input" />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Beschäftigungsinformationen</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Letzter Arbeitgeber *</label>
                  <input {...register('lastEmployer')} className="form-input" />
                  {errors.lastEmployer && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastEmployer.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Ende des Arbeitsverhältnisses *</label>
                  <input {...register('employmentEnd')} type="date" className="form-input" />
                  {errors.employmentEnd && (
                    <p className="text-red-400 text-sm mt-1">{errors.employmentEnd.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Grund der Beendigung *</label>
                  <textarea
                    {...register('reasonForTermination')}
                    rows={3}
                    className="form-input"
                  />
                  {errors.reasonForTermination && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.reasonForTermination.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="form-label">Letztes Monatseinkommen (Brutto) *</label>
                  <input
                    {...register('monthlyIncome')}
                    type="number"
                    step="0.01"
                    className="form-input"
                  />
                  {errors.monthlyIncome && (
                    <p className="text-red-400 text-sm mt-1">{errors.monthlyIncome.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Bankverbindung</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">IBAN *</label>
                  <input
                    {...register('iban')}
                    placeholder="DE00000000000000000000"
                    className="form-input"
                  />
                  {errors.iban && (
                    <p className="text-red-400 text-sm mt-1">{errors.iban.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">BIC *</label>
                  <input {...register('bic')} className="form-input" />
                  {errors.bic && (
                    <p className="text-red-400 text-sm mt-1">{errors.bic.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Digitale Unterschrift</h2>
              <SignaturePad onSave={setSignature} />
            </div>

            {/* GDPR Consent */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Datenschutz</h2>
              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    {...register('gdprConsent')}
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-300">
                    Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der{' '}
                    <a href="/legal/datenschutz" className="text-blue-400 hover:underline">
                      Datenschutzerklärung
                    </a>{' '}
                    zu. *
                  </span>
                </label>
                {errors.gdprConsent && (
                  <p className="text-red-400 text-sm">{errors.gdprConsent.message}</p>
                )}

                <label className="flex items-start space-x-3">
                  <input
                    {...register('newsletterConsent')}
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-300">
                    Ich möchte über Updates und Neuigkeiten per E-Mail informiert werden.
                    (optional)
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="button-primary px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Wird eingereicht...' : 'Antrag einreichen'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}