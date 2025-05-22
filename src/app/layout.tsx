
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        {/* Meta tags e outros elementos de cabeçalho */}
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}