'use server'

import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export async function getVideoUrl(raceName: string, heatName: string): Promise<string | null> {
  try {
    // Extract numeric portion from heatName (e.g., "heat1" -> 1)
    const heatMatch = heatName.match(/\d+/)
    const heatNumber = heatMatch ? parseInt(heatMatch[0]) : null

    if (!heatNumber) {
      return null
    }

    const result = await sql`
      SELECT "Url" FROM "videoTable"
      WHERE "RaceName" = ${raceName}
      AND "HeatNumber" = ${heatNumber}
    `

    if (result.length > 0) {
      return result[0].Url as string
    }

    return null
  } catch (error) {
    console.error('Error fetching video URL:', error)
    return null
  }
}
