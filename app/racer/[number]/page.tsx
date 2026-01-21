import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import postgres from 'postgres'
import ProtectedContent from '@/components/protected-content'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

interface RacerDetailProps {
  params: {
    number: string
  }
}

interface Racer {
  Number: number
  Name: string
  Troop: number
  Level: string
  Image: Uint8Array
}

export const dynamic = 'force-dynamic'

export default async function RacerDetail({ params }: RacerDetailProps) {
  const resolvedParams = await params
  const racerNumber = parseInt(resolvedParams.number)

  // Validate that the number is actually a valid integer
  if (isNaN(racerNumber)) {
    notFound()
  }

  try {
    const data = await sql`SELECT * FROM "raceTable" WHERE "Number" = ${racerNumber}`

    if (!data || data.length === 0) {
      notFound()
    }

    const racer = data[0] as Racer
    const imageData = `data:image/jpeg;base64,${Buffer.from(racer.Image).toString(
      'base64'
    )}`

    const levelColorMap: { [key: string]: string } = {
      Daisy: 'rgb(0, 153, 255)',
      Brownie: 'rgb(102, 51, 0)',
      Junior: 'rgb(153, 51, 153)',
      Cadette: 'rgb(204, 0, 0)',
      Senior: 'rgb(255, 102, 51)',
      Ambassador: 'rgb(255, 153, 51)',
      Adult: 'rgb(204, 204, 204)'
    }

    const levelColor = levelColorMap[racer.Level] || 'rgb(128, 128, 128)'
    const darkerColor = levelColorMap[racer.Level]
      ? `rgb(${Math.max(0, parseInt(levelColor.match(/\d+/g)![0]) - 60)}, ${Math.max(
          0,
          parseInt(levelColor.match(/\d+/g)![1]) - 60
        )}, ${Math.max(0, parseInt(levelColor.match(/\d+/g)![2]) - 60)})`
      : 'rgb(80, 80, 80)'

    const colorStyle = {
      background: `linear-gradient(135deg, ${levelColor} 0%, ${darkerColor} 100%)`,
      boxShadow: `0 4px 15px rgba(0, 0, 0, 0.2), inset -1px -1px 3px rgba(255, 255, 255, 0.2)`
    }

    return (
      <ProtectedContent>
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
          <div className="w-full max-w-2xl">
            <Link
              href="/"
              className="mb-4 inline-flex items-center text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              ← Back to List
            </Link>

            <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-2xl ring-1 ring-white/60">
              <div className="flex flex-col items-center">
                <div
                  className="bg-gradient-to-br p-2 rounded-full ring-4 ring-white shadow-lg mb-6"
                  style={colorStyle}
                >
                  <Image
                    src={imageData}
                    alt={racer.Name}
                    width={200}
                    height={200}
                    className="rounded-full"
                  />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
                  {racer.Name}
                </h1>

                <div className="flex items-center gap-4 mb-8">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Member Number</p>
                    <p className="text-2xl font-bold text-gray-900">{racer.Number}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Troop</p>
                    <p className="text-2xl font-bold text-gray-900">{racer.Troop}</p>
                  </div>
                </div>

                <span
                  className="inline-block px-6 py-2 rounded-full text-lg font-bold text-white bg-gradient-to-r mb-8"
                  style={colorStyle}
                >
                  {racer.Level}
                </span>

                <div className="w-full bg-gray-100 rounded-lg p-4 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Details</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900">{racer.Name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-semibold text-gray-900">{racer.Level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Troop:</span>
                      <span className="font-semibold text-gray-900">Troop {racer.Troop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member ID:</span>
                      <span className="font-semibold text-gray-900">{racer.Number}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ProtectedContent>
    )
  } catch (error) {
    console.error('Error fetching racer details:', error)
    notFound()
  }
}
