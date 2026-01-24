'use client'

import { useState, useRef, useEffect } from 'react'

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isPhotoTaken, setIsPhotoTaken] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  const setupCamera = async (mode: 'user' | 'environment' = 'user') => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      })
      setHasPermission(true)
      setStream(mediaStream)
      setFacingMode(mode)
      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsRequesting(false)
    } catch (err) {
      setHasPermission(false)
      setIsRequesting(false)
    }
  }

  const requestPermission = async () => {
    setIsRequesting(true)
    await setupCamera(facingMode)
  }

  const switchCamera = async () => {
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Switch to the other camera
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    await setupCamera(newFacingMode)
  }

  useEffect(() => {
    if (!isOpen) return

    setupCamera()

    return () => {
      // Stop all camera tracks when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    // Ensure video plays when returning to live view
    if (videoRef.current && !isPhotoTaken && stream) {
      videoRef.current.play().catch(() => {
        // Ignore play errors
      })
    }
  }, [isPhotoTaken, stream])

  const takePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current

      // Check if video has dimensions
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        // Create a temporary canvas to draw the image
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = video.videoWidth
        tempCanvas.height = video.videoHeight
        const context = tempCanvas.getContext('2d')

        if (context) {
          context.drawImage(video, 0, 0)
          // Convert to data URL and store
          const imageData = tempCanvas.toDataURL('image/jpeg')
          setCapturedImage(imageData)
          setIsPhotoTaken(true)
        }
      } else {
        console.error('Video not ready - dimensions are 0')
      }
    }
  }

  const retakePhoto = () => {
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Reset all state
    setIsPhotoTaken(false)
    setCapturedImage(null)
    setHasPermission(null)
    setStream(null)

    // Reinitialize camera
    setupCamera()
  }

  const uploadPhoto = () => {
    if (capturedImage) {
      console.log('Photo captured:', capturedImage)
      // TODO: Handle upload logic here
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Camera</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="bg-black rounded-lg overflow-hidden mb-4 relative">
            {hasPermission === false ? (
              <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-900 gap-4 px-4">
                <p className="text-white text-center">Camera permission is required to take photos</p>
                <button
                  onClick={requestPermission}
                  disabled={isRequesting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  {isRequesting ? 'Requesting...' : 'Request Permission'}
                </button>
              </div>
            ) : isPhotoTaken && capturedImage ? (
              <div className="w-full h-64 flex items-center justify-center bg-black">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="max-w-full max-h-full"
                />
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={switchCamera}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  title="Switch camera"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H4m0 0l3-3m-3 3l3 3M16 8h4m0 0l-3 3m3-3l-3-3"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {hasPermission === false ? (
              <button
                onClick={onClose}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            ) : !isPhotoTaken ? (
              <button
                onClick={takePhoto}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Take Photo
              </button>
            ) : (
              <>
                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Retake Photo
                </button>
                <button
                  onClick={uploadPhoto}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Upload
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
