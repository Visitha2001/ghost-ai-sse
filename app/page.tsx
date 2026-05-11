import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Ghost AI</h1>
      <Link href="/editor">
        <Button>Open Editor</Button>
      </Link>
    </div>
  )
}