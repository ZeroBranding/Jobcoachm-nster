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
import FileUpload from '@/components/FileUpload'
import WhatsAppModal from '@/components/WhatsAppModal'
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWhatsApp, setShowWhatsApp] = useState(false)

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
      
      // Upload files if any
      if (uploadedFiles.length > 0) {
        // File upload logic would go here
        console.log('Uploading files:', uploadedFiles)
      }
      
      toast.success('Antrag erfolgreich eingereicht!')
      reset()
      setSignature('')
      setUploadedFiles([])
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
      
      <main id="main-content" className="container mx-auto px-4 pt-24 pb-12">
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

          {/* Live Region for form errors */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {Object.keys(errors).length > 0 && (
              <span>Formular enthält {Object.keys(errors).length} Fehler</span>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            {/* Personal Information */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Persönliche Angaben</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="form-label">Vorname *</label>
                  <input 
                    id="firstName"
                    {...register('firstName')} 
                    className="form-input" 
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="form-label">Nachname *</label>
                  <input 
                    id="lastName"
                    {...register('lastName')} 
                    className="form-input"
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="form-label">E-Mail *</label>
                  <input 
                    id="email"
                    {...register('email')} 
                    type="email" 
                    className="form-input"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-400 text-sm mt-1" role="alert" aria-live="polite">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="form-label">Telefon *</label>
                  <input 
                    id="phone"
                    {...register('phone')} 
                    type="tel" 
                    className="form-input"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="form-label">Geburtsdatum *</label>
                  <input 
                    id="dateOfBirth"
                    {...register('dateOfBirth')} 
                    type="date" 
                    className="form-input"
                    aria-invalid={!!errors.dateOfBirth}
                    aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                  />
                  {errors.dateOfBirth && (
                    <p id="dateOfBirth-error" className="text-red-400 text-sm mt-1" role="alert">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Adresse</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="street" className="form-label">Straße *</label>
                  <input 
                    id="street"
                    {...register('street')} 
                    className="form-input"
                    aria-invalid={!!errors.street}
                  />
                  {errors.street && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.street.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="houseNumber" className="form-label">Hausnummer *</label>
                  <input 
                    id="houseNumber"
                    {...register('houseNumber')} 
                    className="form-input"
                    aria-invalid={!!errors.houseNumber}
                  />
                  {errors.houseNumber && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.houseNumber.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="postalCode" className="form-label">PLZ *</label>
                  <input 
                    id="postalCode"
                    {...register('postalCode')} 
                    className="form-input"
                    aria-invalid={!!errors.postalCode}
                  />
                  {errors.postalCode && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.postalCode.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="city" className="form-label">Stadt *</label>
                  <input 
                    id="city"
                    {...register('city')} 
                    className="form-input"
                    aria-invalid={!!errors.city}
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Beschäftigungsinformationen</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="lastEmployer" className="form-label">Letzter Arbeitgeber *</label>
                  <input 
                    id="lastEmployer"
                    {...register('lastEmployer')} 
                    className="form-input"
                    aria-invalid={!!errors.lastEmployer}
                  />
                  {errors.lastEmployer && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.lastEmployer.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="employmentEnd" className="form-label">Ende des Arbeitsverhältnisses *</label>
                  <input 
                    id="employmentEnd"
                    {...register('employmentEnd')} 
                    type="date" 
                    className="form-input"
                    aria-invalid={!!errors.employmentEnd}
                  />
                  {errors.employmentEnd && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.employmentEnd.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="reasonForTermination" className="form-label">Grund der Beendigung *</label>
                  <textarea
                    id="reasonForTermination"
                    {...register('reasonForTermination')}
                    rows={3}
                    className="form-input"
                    aria-invalid={!!errors.reasonForTermination}
                  />
                  {errors.reasonForTermination && (
                    <p className="text-red-400 text-sm mt-1" role="alert">
                      {errors.reasonForTermination.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="monthlyIncome" className="form-label">Letztes Monatseinkommen (Brutto) *</label>
                  <input
                    id="monthlyIncome"
                    {...register('monthlyIncome')}
                    type="number"
                    step="0.01"
                    className="form-input"
                    aria-invalid={!!errors.monthlyIncome}
                  />
                  {errors.monthlyIncome && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.monthlyIncome.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Bankverbindung</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="iban" className="form-label">IBAN *</label>
                  <input
                    id="iban"
                    {...register('iban')}
                    placeholder="DE00000000000000000000"
                    className="form-input"
                    aria-invalid={!!errors.iban}
                  />
                  {errors.iban && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.iban.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="bic" className="form-label">BIC *</label>
                  <input 
                    id="bic"
                    {...register('bic')} 
                    className="form-input"
                    aria-invalid={!!errors.bic}
                  />
                  {errors.bic && (
                    <p className="text-red-400 text-sm mt-1" role="alert">{errors.bic.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Dokumente</h2>
              <FileUpload 
                onFilesSelected={setUploadedFiles}
                maxFiles={5}
                maxSizeMB={10}
                acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
              />
            </div>

            {/* Digital Signature */}
            <div className="glass-effect p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6">Digitale Unterschrift</h2>
              <SignaturePad onSave={setSignature} required />
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
                    aria-describedby="gdpr-description"
                  />
                  <span id="gdpr-description" className="text-sm text-gray-300">
                    Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der{' '}
                    <a href="/legal/datenschutz" className="text-blue-400 hover:underline">
                      Datenschutzerklärung
                    </a>{' '}
                    zu. *
                  </span>
                </label>
                {errors.gdprConsent && (
                  <p className="text-red-400 text-sm" role="alert">{errors.gdprConsent.message}</p>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => setShowWhatsApp(true)}
                className="button-secondary px-8 py-4 text-lg flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp-Beratung
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="button-primary px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Wird eingereicht...' : 'Antrag einreichen'}
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
      
      {/* WhatsApp Modal */}
      <WhatsAppModal 
        isOpen={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
        message="Hallo, ich benötige Hilfe beim ALG-Antrag"
      />
    </div>
  )
}