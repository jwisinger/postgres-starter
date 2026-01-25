import postgres from 'postgres'
import TableWithFilter from './table-with-filter'
import getImages from '@/lib/getImages'

// Get list of non-template databases
async function getAvailableDatabases() {
  try {
    // Connect to postgres system database to query all databases
    const baseUrl = process.env.POSTGRES_URL!.replace(/\/[^/]+$/, '/postgres')
    const adminSql = postgres(baseUrl, { ssl: "require" })

    const databases = await adminSql`
      SELECT datname FROM pg_database
      WHERE NOT datistemplate
      AND datname NOT IN ('postgres', 'retool')
      ORDER BY datname
    `

    await adminSql.end()
    return databases.map((db: any) => db.datname)
  } catch (error) {
    console.error('Error fetching databases:', error)
    return []
  }
}

export default async function Table() {
  let racers
  let videoLinks
  let databases
  let blobImages

  try {
    databases = await getAvailableDatabases()
    if (databases.length > 0) {
      const baseUrl = process.env.POSTGRES_URL! + databases[0]
      const sql = postgres(baseUrl, { ssl: "require" })
      racers = await sql`SELECT * FROM "raceTable"`
      videoLinks = await sql`SELECT * FROM "videoTable"`
    }
  } catch (e: any) {
      throw e
  }

  blobImages = await getImages()

  // Convert Uint8Array Image to base64 string for client component
  if (racers != null) {
    const processedData = racers.map((user: any) => ({
      ...user,
      Image: `data:image/jpeg;base64,${Buffer.from(user.Image).toString('base64')}`
    }))
    
    return <TableWithFilter racers={processedData} databases={databases || []} blobImages={blobImages}/>
  } else return "";
}
