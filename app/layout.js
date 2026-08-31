import "./globals.css";
import AuthProvider from '@/components/AuthProvider';
import { Toaster } from 'sonner';

export const metadata = {
  title: "Arjun Photography CRM",
  description: "High-Fidelity Client Case Management and Photography CRM System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col bg-[#f0f4fa] text-[#1e2229]">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
