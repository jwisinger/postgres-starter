'use client'

import { useState, useRef, useEffect } from 'react'
import { getVideoUrl } from '@/lib/actions'

interface RaceTimeEntry {
  raceName: string
  heatName: string
  value: string
  originalLabel: string
}

interface RaceTimesProps {
  times: RaceTimeEntry[]
  database?: string
}

export default function RaceTimes({ times, database }: RaceTimesProps) {
  const [selectedRace, setSelectedRace] = useState<RaceTimeEntry | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  useEffect(() => {
    if (selectedRace) {
      setIsLoadingVideo(true)
      getVideoUrl(selectedRace.raceName, selectedRace.heatName, database).then((url) => {
        setVideoUrl(url)
        setIsLoadingVideo(false)
      })
    }
  }, [selectedRace, database])

  return (
    <>
      <div className="space-y-2">
        {times.length > 0 ? (
          <>
            {times.map((entry, index) => (
              <button
                key={index}
                onClick={() => setSelectedRace(entry)}
                className="w-full flex justify-between px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-gray-900 font-medium transition-colors text-left border border-blue-200 hover:border-blue-300"
              >
                <span>{entry.originalLabel}</span>
                <span className="font-semibold text-gray-900">{entry.value}</span>
              </button>
            ))}
          </>
        ) : (
          <div className="text-gray-500">No times recorded</div>
        )}
      </div>

      {/* Modal */}
      {selectedRace && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRace(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedRace(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedRace.raceName}
              </h2>
              <p className="text-lg text-gray-600">
                {selectedRace.heatName}
              </p>
            </div>

            {/* Video player */}
            {isLoadingVideo ? (
              <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-gray-500">Loading video...</p>
              </div>
            ) : videoUrl ? (
              <video
                ref={videoRef}
                className="w-full aspect-video bg-gray-200 rounded-lg mb-4"
                controls
                controlsList="nodownload"
              >
                <source
                  src={videoUrl}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-gray-500">No video found for this race</p>
              </div>
            )}

            {/* Playback speed toggle button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setPlaybackRate(playbackRate === 1 ? 0.25 : 1)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {playbackRate === 1 ? 'Regular Speed' : 'Slow Motion (0.25x)'}
              </button>
            </div>

            {/* Race time display */}
            <div className="text-center text-gray-600 mt-6">
              <p className="font-semibold">Time: {selectedRace.value}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
