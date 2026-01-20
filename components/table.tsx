import postgres from 'postgres'
import { timeAgo } from '@/lib/utils'
import Image from 'next/image'
import RefreshButton from './refresh-button'
import { seed } from '@/lib/seed'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export default async function Table() {
  let data
  let startTime = Date.now()

  try {
    data = await sql`SELECT * FROM "raceTable"`
  } catch (e: any) {
      throw e
  }

  const profiles = data
  const duration = Date.now() - startTime
  
  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Racers</h2>
          <p className="text-sm text-gray-500">
          </p>
        </div>
        <RefreshButton />
      </div>
      <div className="divide-y divide-gray-900/5">
        {profiles.map((user) => (
          <div
            key={user.Number}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4" >
            <Image
                src={`data:image/jpeg;base64,${Buffer.from(user.Image).toString('base64')}`}
                alt={user.Name}
                width={64}
                height={64}
                className="rounded-full ring-1 ring-gray-900/5"
             />
              <div className="space-y-1">
                <p className="font-medium leading-none">{user.Name}</p>
                <p className="text-sm text-gray-500">Troop {user.Troop}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">{user.Level}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
