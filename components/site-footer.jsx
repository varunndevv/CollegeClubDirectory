export function SiteFooter() {
  return (
    <footer className="relative border-t border-primary/10 bg-background/40 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-medium text-foreground text-sm">
              College Club Directory
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Connecting students with communities at BMSCE.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BMS College of Engineering
          </div>
        </div>
      </div>
    </footer>
  )
}
