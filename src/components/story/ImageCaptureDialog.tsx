import { useState, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import * as Dialog from '@radix-ui/react-dialog';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCaptureDialogProps {
  onCapture: (image: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageCaptureDialog({ onCapture, isOpen, onClose }: ImageCaptureDialogProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const handleAccept = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-display font-bold text-gray-800">
              Take a Photo
            </Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <AnimatePresence mode="wait">
            {!capturedImage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    onUserMedia={() => setIsCameraReady(true)}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={capture}
                    disabled={!isCameraReady}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Camera size={20} />
                    <span>Take Photo</span>
                  </button>

                  <label className="bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2 cursor-pointer">
                    <ImageIcon size={20} />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleRetake}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2"
                  >
                    <Camera size={20} />
                    <span>Retake</span>
                  </button>

                  <button
                    onClick={handleAccept}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2"
                  >
                    <ImageIcon size={20} />
                    <span>Use Photo</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}