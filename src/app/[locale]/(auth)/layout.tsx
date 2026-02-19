export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-sidebar-light to-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-primary/20" />
          <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-accent/10" />
        </div>

        <div className="relative text-center max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-dark shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white tracking-wide">INNOVTEC</h1>
              <p className="text-sm text-white/50 font-medium tracking-[0.3em] uppercase">Réseaux</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Votre espace de travail collaboratif
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Gérez vos projets, suivez la sécurité de vos chantiers,
            accédez à vos documents et collaborez avec toute l&apos;équipe
            depuis un seul endroit.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4 text-left">
            {[
              'Suivi QSE & sécurité en temps réel',
              'Signature électronique de documents',
              'Gestion des formations et certifications',
              'Planning collaboratif des équipes',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        {children}
      </div>
    </div>
  );
}
