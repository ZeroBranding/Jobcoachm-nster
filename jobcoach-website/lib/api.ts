import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ApplicationData {
  type: 'ALG' | 'KINDERGELD' | 'WOHNGELD'
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: Date
  address: string
  city: string
  postalCode: string
  formData: any
  signature: string
  gdprConsent: boolean
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const submitApplication = async (data: ApplicationData) => {
  try {
    const response = await api.post('/applications', data)
    return response.data
  } catch (error) {
    console.error('Error submitting application:', error)
    throw error
  }
}

export const getApplicationStatus = async (id: string) => {
  try {
    const response = await api.get(`/applications/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching application status:', error)
    throw error
  }
}

export const uploadDocument = async (applicationId: string, file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('applicationId', applicationId)

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error uploading document:', error)
    throw error
  }
}