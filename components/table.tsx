import postgres from 'postgres'
import TableWithFilter from './table-with-filter'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export default async function Table() {
  let racers
  let videoLinks

  try {
    racers = await sql`SELECT * FROM "raceTable"`
    videoLinks = await sql`SELECT * FROM "videoTable"`
  } catch (e: any) {
      throw e
  }

  // Convert Uint8Array Image to base64 string for client component
  const processedData = racers.map((user: any) => ({
    ...user,
    Image: `data:image/jpeg;base64,${Buffer.from(user.Image).toString('base64')}`
  }))

  return <TableWithFilter racers={processedData} />
}
