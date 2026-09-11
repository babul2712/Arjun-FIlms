import "./globals.css";
import AuthProvider from '@/components/AuthProvider';
import { Toaster } from 'sonner';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  title: "Arjun Films CRM",
  description: "High-Fidelity Client Case Management and Photography CRM System",
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased font-sans ${montserrat.variable} ${montserrat.className}`}
    >
      <body className="min-h-full flex flex-col bg-[#fdf6f6] text-[#1e2229]">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
