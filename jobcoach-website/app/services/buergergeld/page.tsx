'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

// Components
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProgressBar from '@/components/wizard/ProgressBar'
import PersonalDataStep from '@/components/wizard/steps/PersonalDataStep'
import HouseholdStep from '@/components/wizard/steps/HouseholdStep'
import IncomeStep from '@/components/wizard/steps/IncomeStep'
import HousingStep from '@/components/wizard/steps/HousingStep'
import DocumentsStep from '@/components/wizard/steps/DocumentsStep'
import SummaryStep from '@/components/wizard/steps/SummaryStep'

// Validation Schema
const buergergeldSchema = z.object({
  // Persönliche Daten
  anrede: z.enum(['HERR', 'FRAU', 'DIVERS', 'KEINE']),
  titel: z.string().optional(),
  vorname: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  nachname: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  geburtsdatum: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear()
    return age >= 15 && age <= 100
  }, 'Alter muss zwischen 15 und 100 Jahren liegen'),
  geburtsort: z.string().min(2, 'Geburtsort erforderlich'),
  staatsangehoerigkeit: z.string().default('DE'),
  familienstand: z.enum(['LEDIG', 'VERHEIRATET', 'GESCHIEDEN', 'VERWITWET', 'GETRENNT_LEBEND']),
  
  // Kontakt
  email: z.string().email('Ungültige E-Mail-Adresse'),
  telefon: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Ungültige Telefonnummer'),
  mobiltelefon: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Ungültige Mobilnummer').optional(),
  
  // Identifikation
  steuerIdNummer: z.string().regex(/^\d{11}$/, 'Steuer-ID muss 11 Ziffern haben').optional(),
  sozialversicherungsNummer: z.string().optional(),
  personalausweisnummer: z.string().optional(),
  
  // Adresse
  strasse: z.string().min(3, 'Straße erforderlich'),
  hausnummer: z.string().min(1, 'Hausnummer erforderlich'),
  adresszusatz: z.string().optional(),
  plz: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  ort: z.string().min(2, 'Ort erforderlich'),
  
  // Haushalt
  haushaltTyp: z.enum(['EINZELPERSON', 'PAAR_OHNE_KINDER', 'PAAR_MIT_KINDERN', 'ALLEINERZIEHEND', 'WG']),
  haushaltMitglieder: z.array(z.object({
    vorname: z.string().min(2),
    nachname: z.string().min(2),
    geburtsdatum: z.string(),
    verwandtschaft: z.enum(['EHEPARTNER', 'LEBENSPARTNER', 'KIND', 'ELTERNTEIL', 'GESCHWISTER', 'SONSTIGE']),
    einkommen: z.number().min(0).optional(),
  })).optional(),
  
  // Einkommen
  erwerbstaetig: z.boolean(),
  monatlichesEinkommen: z.number().min(0).optional(),
  einkommensart: z.enum(['ANGESTELLT', 'SELBSTSTAENDIG', 'MINIJOB', 'ARBEITSLOS', 'RENTE', 'SONSTIGES']).optional(),
  weitereEinkuenfte: z.array(z.object({
    art: z.string(),
    betrag: z.number().min(0),
  })).optional(),
  
  // Wohnung
  mietkosten: z.number().min(0, 'Mietkosten müssen angegeben werden'),
  nebenkosten: z.number().min(0, 'Nebenkosten müssen angegeben werden'),
  heizkosten: z.number().min(0, 'Heizkosten müssen angegeben werden'),
  wohnflaeche: z.number().min(10).max(500, 'Wohnfläche muss zwischen 10 und 500 qm liegen'),
  zimmeranzahl: z.number().min(1).max(20),
  
  // Vermögen
  vermoegen: z.number().min(0),
  fahrzeuge: z.array(z.object({
    marke: z.string(),
    modell: z.string(),
    baujahr: z.number(),
    wert: z.number().min(0),
  })).optional(),
  
  // DSGVO
  datenschutzEinwilligung: z.boolean().refine(val => val === true, 'Datenschutzerklärung muss akzeptiert werden'),
  einwilligungKontaktaufnahme: z.boolean().optional(),
})

type BuergergeldFormData = z.infer<typeof buergergeldSchema>

const steps = [
  { id: 'personal', title: 'Persönliche Daten', component: PersonalDataStep },
  { id: 'household', title: 'Haushalt', component: HouseholdStep },
  { id: 'income', title: 'Einkommen', component: IncomeStep },
  { id: 'housing', title: 'Wohnung', component: HousingStep },
  { id: 'documents', title: 'Dokumente', component: DocumentsStep },
  { id: 'summary', title: 'Zusammenfassung', component: SummaryStep },
]

export default function BuergergeldWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const methods = useForm<BuergergeldFormData>({
    resolver: zodResolver(buergergeldSchema),
    mode: 'onChange',
    defaultValues: {
      staatsangehoerigkeit: 'DE',
      haushaltTyp: 'EINZELPERSON',
      erwerbstaetig: false,
      vermoegen: 0,
      datenschutzEinwilligung: false,
    }
  })

  const { handleSubmit, trigger, formState: { errors, isValid } } = methods

  const nextStep = async () => {
    // Validate current step fields
    const stepFields = getStepFields(currentStep)
    const isStepValid = await trigger(stepFields as any)
    
    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else if (!isStepValid) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const getStepFields = (step: number): string[] => {
    const fieldsByStep = [
      ['anrede', 'vorname', 'nachname', 'geburtsdatum', 'geburtsort', 'email', 'telefon'],
      ['haushaltTyp', 'haushaltMitglieder'],
      ['erwerbstaetig', 'monatlichesEinkommen', 'einkommensart'],
      ['mietkosten', 'nebenkosten', 'heizkosten', 'wohnflaeche', 'zimmeranzahl'],
      [],
      ['datenschutzEinwilligung'],
    ]
    return fieldsByStep[step] || []
  }

  const onSubmit = async (data: BuergergeldFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/antrag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          typ: 'BUERGERGELD',
          formularDaten: data,
          begruendung: 'Antrag auf Bürgergeld',
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Einreichen des Antrags')
      }

      const result = await response.json()
      
      toast.success('Ihr Antrag wurde erfolgreich eingereicht!')
      
      // Redirect to success page
      router.push(`/antrag/success/${result.referenzNummer}`)
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Fehler beim Einreichen des Antrags. Bitte versuchen Sie es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Bürgergeld beantragen</span>
            </h1>
            <p className="text-xl text-gray-400">
              Schritt {currentStep + 1} von {steps.length}: {steps[currentStep].title}
            </p>
          </div>

          {/* Progress Bar */}
          <ProgressBar 
            steps={steps.map(s => s.title)} 
            currentStep={currentStep}
            className="mb-8"
          />

          {/* Form */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-effect p-8 rounded-2xl"
                >
                  <CurrentStepComponent />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Vorheriger Schritt"
                >
                  ← Zurück
                </button>

                {/* Step indicator */}
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-blue-500 w-8'
                          : index < currentStep
                          ? 'bg-blue-300'
                          : 'bg-gray-600'
                      }`}
                      aria-label={`Zu Schritt ${index + 1}`}
                    />
                  ))}
                </div>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="button-primary"
                    aria-label="Nächster Schritt"
                  >
                    Weiter →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Wird eingereicht...
                      </>
                    ) : (
                      'Antrag einreichen'
                    )}
                  </button>
                )}
              </div>

              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
                  role="alert"
                  aria-live="polite"
                >
                  <h3 className="font-semibold text-red-400 mb-2">
                    Bitte korrigieren Sie folgende Fehler:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-300">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>
                        {field}: {error?.message}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </form>
          </FormProvider>

          {/* Help Section */}
          <div className="mt-12 glass-effect p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-3">Benötigen Sie Hilfe?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <a
                href="/help/buergergeld"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Hilfe zum Bürgergeld</span>
              </a>
              <a
                href="tel:+4925150000"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>0251 / 50000</span>
              </a>
              <a
                href="/contact"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Kontaktformular</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}