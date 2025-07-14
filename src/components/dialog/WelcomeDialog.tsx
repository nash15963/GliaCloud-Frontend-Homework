import { useState } from "react"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface WelcomeDialogProps {
  initialOpen?: boolean
}

const WelcomeDialog = ({ initialOpen = true }: WelcomeDialogProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [showFloatingButton, setShowFloatingButton] = useState(!initialOpen)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setShowFloatingButton(true)
    }
  }

  const handleFloatingButtonClick = () => {
    setIsOpen(true)
    setShowFloatingButton(false)
  }

  return (
    <>
      {/* Floating Help Button */}
      {showFloatingButton && (
        <button
          onClick={handleFloatingButtonClick}
          className="fixed top-4 right-4 z-50 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
          aria-label="Help">
          <QuestionMarkCircledIcon className="w-5 h-5" />
        </button>
      )}

      {/* Welcome Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[400px] w-[90vw] sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Welcome to GliaCloud Frontend Homework</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Video Highlight Demo Application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">•</span>
                <p className="text-sm">
                  This demo website is the <strong>GliaCloud Frontend Homework</strong> project.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">•</span>
                <div className="text-sm">
                  <p className="mb-2">
                    For the complete demonstration of the website's features, please download the file from:
                  </p>
                  <a
                    href="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline break-all">
                    BigBuckBunny.mp4 (Open Source)
                  </a>
                  <p className="mt-2">Use this file during testing to experience the full functionality.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">•</span>
                <p className="text-sm">Complete demo functionality is explained in the documentation.</p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">•</span>
                <p className="text-sm">
                  <strong>Have a good day!</strong> 🎉
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Click the help button in the top-right corner to reopen this dialog
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default WelcomeDialog