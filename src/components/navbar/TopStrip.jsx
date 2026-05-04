import { useState, useRef, useEffect } from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaTwitter, FaLinkedinIn, FaFacebookF } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

export default function TopStrip({
  phone = "+880 1XX-XXX-XXXX",
  email = "info@fzfashion.com",
  address = "House 256, Road: 03 (East Side) DOHS Baridhara,",
  onSearch,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = () => {
    if (onSearch) onSearch(query);
    setSearchOpen(false);
  };

  const handleKeyToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSearchOpen((s) => !s);
    }
  };

  return (
    <div className="bg-secondary dark:bg-secondary border-b border-accent text-sm text-body dark:text-body transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          {/* Left: Contact Info */}
          <div className="flex items-center gap-5 min-w-0">
            {/* Phone */}
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 truncate group"
              aria-label={`Call ${phone}`}
            >
              <FiPhone className="w-4 h-4 text-heading dark:text-heading" />
              <span className="text-xs sm:text-sm truncate text-heading">{phone}</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="hidden sm:flex items-center gap-2 hover:text-accent transition-colors truncate"
              aria-label={`Email ${email}`}
            >
              <FiMail className="w-4 h-4 text-heading dark:text-heading" />
              <span className="text-xs sm:text-sm truncate text-heading">{email}</span>
            </a>

            {/* Location */}
            <div
              className="hidden md:flex items-center gap-2 truncate hover:text-primary transition-colors"
              title={address}
              aria-label={`Address ${address}`}
            >
              <FiMapPin className="w-4 h-4 text-heading dark:text-heading" />
              <span className="text-xs sm:text-sm truncate text-heading">{address}</span>
            </div>
          </div>

          {/* Right: Search + Socials */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                onKeyDown={handleKeyToggle}
                aria-expanded={searchOpen}
                aria-controls="topstrip-search-popover"
                aria-label="Toggle search"
                className="p-1 rounded-md hover:bg-neutral dark:hover:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              >
                <FiSearch className="w-4 h-4 text-heading " />
              </button>

              {searchOpen && (
                <div
                  id="topstrip-search-popover"
                  role="dialog"
                  aria-label="Search"
                  className="absolute right-0 mt-2 w-56 bg-neutral dark:bg-primary border border-accent rounded-md shadow-lg p-2 z-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search..."
                      aria-label="Search input"
                      className="w-full text-sm bg-transparent outline-none px-2 py-1 text-heading dark:text-neutral"
                    />
                    <button
                      onClick={handleSearch}
                      aria-label="Submit search"
                      className="p-1 rounded-md hover:bg-accent transition-colors"
                    >
                      <FiSearch className="w-4 h-4 text-heading" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-accent transition-colors"
                aria-label="Open Twitter"
              >
                <FaTwitter className="w-4 h-4 text-heading" />
              </a>

              <a
                href="https://www.linkedin.com/in/zamal-u-ahmed-0b866b7b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app "
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-accent transition-colors"
                aria-label="Open LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4 text-heading" />
              </a>

              <a
                href="https://www.facebook.com/share/1H1dx4T9rY/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-accent transition-colors"
                aria-label="Open Facebook"
              >
                <FaFacebookF className="w-4 h-4 text-heading" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
