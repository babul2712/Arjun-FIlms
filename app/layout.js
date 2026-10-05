import "./globals.css";
import {
  Montserrat,
  Poppins,
  Inter,
  Plus_Jakarta_Sans,
  Outfit,
  Space_Grotesk,
} from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import FontThemeProvider from '@/components/FontThemeProvider';
import { Toaster } from 'sonner';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
  const fontVariables = `${montserrat.variable} ${poppins.variable} ${inter.variable} ${plusJakarta.variable} ${outfit.variable} ${spaceGrotesk.variable}`;

  return (
    <html
      lang="en"
      data-site-font="montserrat"
      className={`h-full antialiased ${fontVariables}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:ital,wght@0,300..900;1,300..900&family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fdf6f6] text-[#1e2229]">
        <FontThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-right" richColors />
        </FontThemeProvider>
      </body>
    </html>
  );
}
