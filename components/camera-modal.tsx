'use client'

import { useState, useRef, useEffect } from 'react'

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isPhotoTaken, setIsPhotoTaken] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)

  const setupCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      setHasPermission(true)
      setStream(mediaStream)
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
    await setupCamera()
  }

  useEffect(() => {
    if (!isOpen) return

    setupCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isOpen])

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Check if video has dimensions
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const context = canvas.getContext('2d')
        if (context) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0)
          setIsPhotoTaken(true)
        }
      } else {
        console.error('Video not ready - dimensions are 0')
      }
    }
  }

  const retakePhoto = () => {
    setIsPhotoTaken(false)
  }

  const uploadPhoto = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL('image/jpeg')
      console.log('Photo captured:', imageData)
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

          <div className="bg-black rounded-lg overflow-hidden mb-4">
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
            ) : isPhotoTaken ? (
              <div className="w-full h-64 flex items-center justify-center bg-black">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full"
                  style={{ maxHeight: '100%' }}
                />
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
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
