import { FaTwitter, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

export default function SocialLinks() {
  return (
    <div className="mt-4 flex items-center gap-3">
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
        className="p-2 rounded-md text-blue-500 hover:bg-neutral hover:text-blue-400 transition duration-300 transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-blue-400 dark:hover:bg-neutral-dark"
      >
        <FaTwitter className="w-5 h-5 md:w-6 md:h-6" />
      </a>

      <a
        href="https://www.facebook.com/share/1H1dx4T9rY/?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="p-2 rounded-md text-blue-700 hover:bg-neutral hover:text-blue-600 transition duration-300 transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-blue-600 dark:hover:bg-neutral-dark"
      >
        <FaFacebookF className="w-5 h-5 md:w-6 md:h-6" />
      </a>

      <a
        href="https://www.linkedin.com/in/zamal-u-ahmed-0b866b7b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app "
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="p-2 rounded-md text-pink-500 hover:bg-neutral hover:text-pink-400 transition duration-300 transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-pink-400 dark:hover:bg-neutral-dark"
      >
        <FaLinkedinIn className="w-5 h-5 md:w-6 md:h-6" />
      </a>
    </div>
  );
}
