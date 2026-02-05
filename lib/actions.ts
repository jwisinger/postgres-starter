'use server'

import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export interface RacerData {
  Number: number
  Name: string
  Troop: number
  Level: string
  Image: string
}

// Convert image URL/data to displayable format
function convertImageToDataUrl(imageData: any): string {
  if (!imageData) return ''
  if (typeof imageData === 'string') {
    // Convert Google Drive download URLs to view URLs
    const viewUrl = imageData.replace('export=download', 'export=view')
    // Proxy through our server to avoid CORB blocking
    return `/api/proxy-image?url=${encodeURIComponent(viewUrl)}`
  }

  return ''
}

export async function getVideoUrl(raceName: string, heatName: string, database?: string): Promise<string | null> {
  // Extract numeric portion from heatName (e.g., "heat1" -> 1)
  const heatMatch = heatName.match(/\d+/)
  const heatNumber = heatMatch ? parseInt(heatMatch[0]) : null

  if (!heatNumber) {
    return null
  }

  let dbSql = sql
  const isCustomDb = !!database

  try {
    // Use database-specific connection if provided
    if (database) {
      const baseUrl = process.env.POSTGRES_URL! + database
      dbSql = postgres(baseUrl, { ssl: "require" })
    }

    const result = await dbSql`
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
  } finally {
    if (isCustomDb && dbSql !== sql) {
      await dbSql.end()
    }
  }
}

export async function getRacersFromDatabase(databaseName: string): Promise<RacerData[]> {
  const baseUrl = process.env.POSTGRES_URL! + databaseName
  const dbSql = postgres(baseUrl, { ssl: "require" })

  try {
    const racers = await dbSql`SELECT * FROM "raceTable"`

    // Convert image data to serializable format
    return racers.map((racer: any) => ({
      ...racer,
      Image: convertImageToDataUrl(racer.Image)
    }))
  } catch (error) {
    console.error(`Error fetching racers from database ${databaseName}:`, error)
    return []
  } finally {
    await dbSql.end()
  }
}
