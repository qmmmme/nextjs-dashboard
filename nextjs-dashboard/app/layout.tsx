import '@/app/ui/global.css';

//include a metadata object from any layout.js or page.js file to add additional page information like title and description. 
//Any metadata in layout.js will be inherited by all pages that use it.
import { Metadata } from 'next';

//Next.js will automatically add the title and metadata to your application.
//use the title.template field in the metadata object to define a template for your page titles. 
//This template can include the page title, and any other information you want to include.
export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',//The %s in the template will be replaced with the specific page title.
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
