const ScubaMaskLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Location pin top */}
    <path
      d="M12 0C6.48 0 2 4.03 2 9c0 3.26 2.2 6.76 4.5 9.5L12 25l5.5-6.5C19.8 15.76 22 12.26 22 9c0-4.97-4.48-9-10-9z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Mask left lens */}
    <ellipse
      cx="8.5"
      cy="10"
      rx="3.2"
      ry="2.4"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    {/* Mask right lens */}
    <ellipse
      cx="15.5"
      cy="10"
      rx="3.2"
      ry="2.4"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    {/* Bridge between lenses */}
    <path
      d="M11.3 10c0-0.6 0.6-1 1.4-1s1.4 0.4 1.4 1"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Pin point at bottom */}
    <circle cx="12" cy="28" r="1.5" fill="currentColor" />
  </svg>
);

export default ScubaMaskLogo;
