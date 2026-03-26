import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="font-heading font-semibold mb-2">✦ The Word</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A free, beautiful, distraction-free Bible for everyone.
              Read scripture the way it was meant to be read.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-heading font-semibold mb-2 text-sm uppercase tracking-wider">
              Quick Links
            </p>
            <nav className="flex flex-col gap-1.5">
              <Link
                href="/bible/genesis/1"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Start Reading
              </Link>
              <Link
                href="/search"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Search Scripture
              </Link>
              <Link
                href="/plans"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reading Plans
              </Link>
              <Link
                href="/bible"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                All Books
              </Link>
            </nav>
          </div>

          {/* Old / New Testament */}
          <div>
            <p className="font-heading font-semibold mb-2 text-sm uppercase tracking-wider">
              Testament
            </p>
            <nav className="flex flex-col gap-1.5">
              <Link
                href="/bible?testament=old"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Old Testament
              </Link>
              <Link
                href="/bible?testament=new"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                New Testament
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Scripture text is in the public domain (KJV). Built with love for the
            glory of God.
          </p>
          <p className="text-xs text-muted-foreground mt-1 opacity-60">
            ✦ ✦ ✦
          </p>
        </div>
      </div>
    </footer>
  );
}
