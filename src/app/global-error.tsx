"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">
              Something went wrong!
            </h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
          </div>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try again
          </button>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
                {error.stack && (
                  <div className="mt-2 text-muted-foreground">
                    {error.stack}
                  </div>
                )}
                {error.digest && (
                  <div className="mt-2 text-muted-foreground">
                    Digest: {error.digest}
                  </div>
                )}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
