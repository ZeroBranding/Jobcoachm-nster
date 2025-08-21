import { prisma } from '../index'
import fs from 'fs/promises'

export async function cleanupExpiredApplications() {
  try {
    console.log('Starting cleanup of expired applications...')

    // Find all expired applications
    const expiredApplications = await prisma.application.findMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
      include: {
        documents: true,
      },
    })

    for (const application of expiredApplications) {
      // Delete associated documents from filesystem
      for (const document of application.documents) {
        try {
          await fs.unlink(document.filePath)
          console.log(`Deleted file: ${document.filePath}`)
        } catch (err) {
          console.error(`Error deleting file ${document.filePath}:`, err)
        }
      }

      // Delete application (cascades to documents)
      await prisma.application.delete({
        where: { id: application.id },
      })

      console.log(`Deleted expired application: ${application.id}`)
    }

    console.log(`Cleanup completed. Deleted ${expiredApplications.length} expired applications.`)
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}