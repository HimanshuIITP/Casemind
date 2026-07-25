import { Scale } from "lucide-react";

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="container-tight px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-6" aria-label="CaseMind">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-black">
                <Scale className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>
                CaseMind
              </span>
            </a>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              The operating system powering lawyers, courts, and litigants.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-gray-900 transition-colors"><TwitterIcon className="w-5 h-5" /></a>
              <a href="#" className="hover:text-gray-900 transition-colors"><GithubIcon className="w-5 h-5" /></a>
              <a href="#" className="hover:text-gray-900 transition-colors"><LinkedinIcon className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Partners</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} CaseMind Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">System Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
