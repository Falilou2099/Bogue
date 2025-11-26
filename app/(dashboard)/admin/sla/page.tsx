"use client"

export default function Page() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Page en cours de migration</h2>
        <p className="text-muted-foreground">
          Cette page est en cours de migration vers la base de données.
        </p>
        <p className="text-sm text-muted-foreground">
          Revenez bientôt !
        </p>
      </div>
    </div>
  )
}
