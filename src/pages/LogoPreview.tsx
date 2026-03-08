const LogoSVG = ({ className = "w-48 h-48", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    viewBox="0 0 200 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Location pin outline - top arc connects with strap */}
    <path
      d="M100 8C55.8 8 20 42 20 84c0 28 16 54 36 74l44 52 44-52c20-20 36-46 36-74C180 42 144.2 8 100 8z"
      stroke={color}
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Strap / head band - arc across the top, connecting to mask sides */}
    <path
      d="M48 68c0 0 10-30 52-30s52 30 52 30"
      stroke={color}
      strokeWidth="9"
      strokeLinecap="round"
      fill="none"
    />

    {/* Left lens */}
    <path
      d="M52 80c0-6 4-12 14-14h16c4 0 7 2 8 5 1 3 0.5 7-1 11-3 8-10 14-20 14-10 0-17-6-17-16z"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Right lens */}
    <path
      d="M148 80c0-6-4-12-14-14h-16c-4 0-7 2-8 5-1 3-0.5 7 1 11 3 8 10 14 20 14 10 0 17-6 17-16z"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Left strap connector from mask to head band */}
    <path
      d="M52 78c-6-1-10 0-12 3"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
    />

    {/* Right strap connector from mask to head band */}
    <path
      d="M148 78c6-1 10 0 12 3"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
    />

    {/* Nose piece - triangular shape below bridge */}
    <path
      d="M90 88c2 4 5 14 10 14s8-10 10-14"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Nose bridge connecting lenses */}
    <path
      d="M88 78c4-3 8-4 12-4s8 1 12 4"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
    />

    {/* Bottom dot */}
    <circle cx="100" cy="228" r="8" fill={color} />
  </svg>
);

const LogoPreview = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold text-foreground mb-8 text-center">Logo Preview — Aprueba antes de aplicar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Dark on light */}
        <div className="bg-white rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dark on Light</h2>
          <LogoSVG className="w-48 h-64" color="#0f5e5a" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="#0f5e5a" />
            <span className="text-xl font-bold" style={{ color: '#0f5e5a' }}>ScubaTrip</span>
          </div>
        </div>

        {/* Light on dark */}
        <div className="bg-ocean-900 rounded-2xl border border-border p-12 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-ocean-300 uppercase tracking-wider">Light on Dark</h2>
          <LogoSVG className="w-48 h-64" color="white" />
          <div className="flex items-center gap-3 mt-4">
            <LogoSVG className="w-8 h-10" color="white" />
            <span className="text-xl font-bold text-white">ScubaTrip</span>
          </div>
        </div>

        {/* Small sizes */}
        <div className="md:col-span-2 bg-muted rounded-2xl p-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">Small sizes (navbar, headers)</h2>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="flex items-center gap-2">
              <LogoSVG className="w-6 h-8" color="#0f5e5a" />
              <span className="font-bold text-foreground">ScubaTrip</span>
            </div>
            <div className="bg-ocean-900 rounded-lg px-4 py-2 flex items-center gap-2">
              <LogoSVG className="w-6 h-8" color="white" />
              <span className="font-bold text-white">ScubaTrip</span>
            </div>
            <div className="flex items-center gap-4">
              <LogoSVG className="w-5 h-7" color="#0f5e5a" />
              <LogoSVG className="w-8 h-10" color="#0f5e5a" />
              <LogoSVG className="w-12 h-16" color="#0f5e5a" />
              <LogoSVG className="w-16 h-20" color="#0f5e5a" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoPreview;
