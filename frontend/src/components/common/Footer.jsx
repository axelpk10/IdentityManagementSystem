export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">
              Identity Management System
            </h3>
            <p className="text-gray-400 text-sm">
              Secure, Decentralized Credentials
            </p>
          </div>

          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Identity Management System. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
