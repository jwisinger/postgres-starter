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

export async function getVideoUrl(raceName: string, heatName: string, database?: string): Promise<string | null> {
  try {
    // Extract numeric portion from heatName (e.g., "heat1" -> 1)
    const heatMatch = heatName.match(/\d+/)
    const heatNumber = heatMatch ? parseInt(heatMatch[0]) : null

    if (!heatNumber) {
      return null
    }

    let dbSql = sql

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

    if (database && dbSql !== sql) {
      await dbSql.end()
    }

    if (result.length > 0) {
      return result[0].Url as string
    }

    return null
  } catch (error) {
    console.error('Error fetching video URL:', error)
    return null
  }
}

export async function getRacersFromDatabase(databaseName: string): Promise<RacerData[]> {
  try {
    const baseUrl = process.env.POSTGRES_URL! + databaseName
    const dbSql = postgres(baseUrl, { ssl: "require" })
    const racers = await dbSql`SELECT * FROM "raceTable"`

    // Convert Uint8Array Image to base64 string
    const processedData = racers.map((user: any) => ({
      ...user,
      Image: `data:image/jpeg;base64,${Buffer.from(user.Image).toString('base64')}`
    }))

    await dbSql.end()
    return processedData
  } catch (error) {
    console.error(`Error fetching racers from database ${databaseName}:`, error)
    return []
  }
}
