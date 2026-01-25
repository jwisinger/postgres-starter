'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import RefreshButton from './refresh-button'
import CameraModal from './camera-modal'
import SlideshowModal from './slideshow-modal'
import { getRacersFromDatabase } from '@/lib/actions'

interface User {
  Number: number
  Name: string
  Troop: number
  Level: string
  Image: string
}

interface TableWithFilterProps {
  racers: User[]
  databases: string[]
}

export default function TableWithFilter({ racers: initialRacers, databases }: TableWithFilterProps) {
  const [data, setData] = useState<User[]>(initialRacers)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false)
  const [slideshowImages, setSlideshowImages] = useState<string[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Set first database as default on mount
  useEffect(() => {
    if (databases.length > 0 && !selectedDatabase) {
      setSelectedDatabase(databases[0])
    }
  }, [databases, selectedDatabase])

  const handleDatabaseChange = async (databaseName: string) => {
    setSelectedDatabase(databaseName)
    setIsLoadingDatabase(true)
    try {
      const racers = await getRacersFromDatabase(databaseName)
      setData(racers)
    } catch (error) {
      console.error('Error loading database:', error)
    } finally {
      setIsLoadingDatabase(false)
    }
  }

  const handleSlideshowOpen = () => {
    // Get all image URLs from current racers
    const images = data
      .filter(racer => racer.Image && racer.Image.trim() !== '')
      .map(racer => racer.Image)

    if (images.length > 0) {
      setSlideshowImages(images)
      setIsSlideshowOpen(true)
    }
  }

  const filteredRacers = useMemo(() => {
    if (!searchTerm.trim()) {
      return data
    }
    return data.filter((user) =>
      user.Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const levelColorMap: { [key: string]: string } = {
    'Daisy': 'rgb(0, 153, 255)',
    'Brownie': 'rgb(102, 51, 0)',
    'Junior': 'rgb(153, 51, 153)',
    'Cadette': 'rgb(204, 0, 0)',
    'Senior': 'rgb(255, 102, 51)',
    'Ambassador': 'rgb(255, 153, 51)',
    'Adult': 'rgb(204, 204, 204)'
  }

  const getColorStyle = (level: string) => {
    const levelColor = levelColorMap[level] || 'rgb(128, 128, 128)'
    const darkerColor = levelColorMap[level]
      ? `rgb(${Math.max(0, parseInt(levelColor.match(/\d+/g)![0]) - 60)}, ${Math.max(0, parseInt(levelColor.match(/\d+/g)![1]) - 60)}, ${Math.max(0, parseInt(levelColor.match(/\d+/g)![2]) - 60)})`
      : 'rgb(80, 80, 80)'

    return {
      background: `linear-gradient(135deg, ${levelColor} 0%, ${darkerColor} 100%)`,
      boxShadow: `0 4px 15px rgba(0, 0, 0, 0.2), inset -1px -1px 3px rgba(255, 255, 255, 0.2)`
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 shadow-2xl ring-1 ring-white/60 rounded-2xl backdrop-blur-lg max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <Image
            src="/GIRL3.jpg"
            alt="G.I.R.L. Logo"
            width={300}
            height={120}
            className="h-24 w-auto"
          />
        </div>
        <div className="flex flex-col items-end py-3 gap-6">
          <RefreshButton />
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-sm text-gray-500 hover:text-gray-900 text-right"
            >
              Menu
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    setIsCameraOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 first:rounded-t-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Take Photo
                </button>
                <button
                  onClick={() => {
                    handleSlideshowOpen()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 last:rounded-b-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 25 25"
                  >
                    <path fill="currentColor" d="M20 3H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h7v3H8v2h8v-2h-3v-3h7c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2M10 13V7l5 3z"/>
                  </svg>
                  View Slideshow
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {databases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            There are no available Events.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Select Event
            </label>
            <select
              value={selectedDatabase || ''}
              onChange={(e) => handleDatabaseChange(e.target.value)}
              disabled={isLoadingDatabase}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-900 bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {databases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-500 transition-colors"
            />
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {filteredRacers.length} of {data.length} results
              </p>
            )}
          </div>

          <div className="space-y-1">
            {filteredRacers.length > 0 ? (
              filteredRacers.map((user) => {
                const colorStyle = getColorStyle(user.Level)

                return (
                  <Link
                    key={user.Number}
                    href={`/racer/${user.Number}?database=${selectedDatabase}`}
                    className="block"
                  >
                    <div
                      className="bg-white/80 backdrop-blur rounded-lg p-2 shadow-lg hover:shadow-xl transition-shadow border border-white/40 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="bg-gradient-to-br p-1 rounded-full ring-2 ring-white shadow-lg flex-shrink-0"
                          style={colorStyle}
                        >
                          <Image
                            src={user.Image}
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
                      <span
                        className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r flex-shrink-0"
                        style={colorStyle}
                      >
                        {user.Level}
                      </span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">
                  No results found for "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </>
      )}
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
      <SlideshowModal isOpen={isSlideshowOpen} onClose={() => setIsSlideshowOpen(false)} images={slideshowImages} />
    </div>
  )
}
