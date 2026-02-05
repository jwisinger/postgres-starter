import postgres from 'postgres'
import TableWithFilter from './table-with-filter'
import getImages from '@/lib/getImages'

// Proxy Google Drive image through our server to avoid CORB issues
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

// Get list of non-template databases
async function getAvailableDatabases() {
  const baseUrl = process.env.POSTGRES_URL!.replace(/\/[^/]+$/, '/postgres')
  const adminSql = postgres(baseUrl, { ssl: "require" })

  try {
    const databases = await adminSql`
      SELECT datname FROM pg_database
      WHERE NOT datistemplate
      AND datname NOT IN ('postgres', 'retool')
      ORDER BY datname
    `

    return databases.map((db: any) => db.datname)
  } catch (error) {
    console.error('Error fetching databases:', error)
    return []
  } finally {
    await adminSql.end()
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
      try {
        racers = await sql`SELECT * FROM "raceTable"`
        videoLinks = await sql`SELECT * FROM "videoTable"`
      } finally {
        await sql.end()
      }
    }
  } catch (e: any) {
      throw e
  }

  blobImages = await getImages()

  // Convert image data to serializable format
  if (racers != null) {
    const serializedRacers = racers.map((racer: any) => ({
      ...racer,
      Image: convertImageToDataUrl(racer.Image)
    }))
    return <TableWithFilter racers={serializedRacers} databases={databases || []} blobImages={blobImages}/>
  } else return "";
}
