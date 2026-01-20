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
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 shadow-2xl ring-1 ring-white/60 rounded-2xl backdrop-blur-lg max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="text-center">
              <div className="text-7xl font-black text-pink-600 leading-none" style={{ fontFamily: 'var(--font-fredoka)' }}>G<span className="text-5xl">.</span></div>
              <p className="text-xs font-semibold text-pink-600 mt-1">go-getter</p>
            </div>
            <div className="text-center">
              <div className="text-7xl font-black text-orange-500 leading-none" style={{ fontFamily: 'var(--font-fredoka)' }}>I<span className="text-5xl">.</span></div>
              <p className="text-xs font-semibold text-orange-500 mt-1">innovator</p>
            </div>
            <div className="text-center">
              <div className="text-7xl font-black text-cyan-500 leading-none" style={{ fontFamily: 'var(--font-fredoka)' }}>R<span className="text-5xl">.</span></div>
              <p className="text-xs font-semibold text-cyan-500 mt-1">risk-taker</p>
            </div>
            <div className="text-center">
              <div className="text-7xl font-black text-green-600 leading-none" style={{ fontFamily: 'var(--font-fredoka)' }}>L<span className="text-5xl">.</span></div>
              <p className="text-xs font-semibold text-green-600 mt-1">leader</p>
            </div>
          </div>
        </div>
        <RefreshButton />
      </div>
      <div className="space-y-1">
        {profiles.map((user) => {
          const levelColors: { [key: string]: string } = {
            'Daisy': 'from-cyan-400 to-cyan-500',
            'Brownie': 'from-amber-700 to-amber-800',
            'Junior': 'from-purple-500 to-purple-700',
            'Cadette': 'from-red-500 to-red-600',
            'Senior': 'from-orange-400 to-orange-600',
            'Ambassador': 'from-yellow-400 to-yellow-500'
          };
          const bgColor = levelColors[user.Level] || 'from-gray-400 to-gray-600';

          return (
            <div
              key={user.Number}
              className="bg-white/80 backdrop-blur rounded-lg p-2 shadow-lg hover:shadow-xl transition-shadow border border-white/40 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-br ${bgColor} p-1 rounded-full ring-2 ring-white shadow-lg flex-shrink-0`}>
                  <Image
                    src={`data:image/jpeg;base64,${Buffer.from(user.Image).toString('base64')}`}
                    alt={user.Name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{user.Name}</p>
                  <p className="text-sm text-gray-600">Troop {user.Troop}</p>
                </div>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${bgColor} flex-shrink-0`}>
                {user.Level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )
}
