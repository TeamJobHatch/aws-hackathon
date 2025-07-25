export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © 2024 JobHatch AI Assistant. Built with Next.js, OpenAI, and modern web technologies.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-600">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 