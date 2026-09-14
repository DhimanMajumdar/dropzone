'use client';

import { Show } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductPreview from '@/components/ProductPreview';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import SecuritySection from '@/components/SecuritySection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import UploadWorkspace from '@/components/UploadWorkspace';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Signed Out Experience: Full SaaS Landing Page */}
        <Show when="signed-out">
          <main>
            <Hero />
            <ProductPreview />
            <Features />
            <HowItWorks />
            <SecuritySection />
            <FinalCTA />
          </main>
          <Footer />
        </Show>

        {/* Signed In Experience: Focused Upload Workspace */}
        <Show when="signed-in">
          <main className="py-8 bg-grid-pattern min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <UploadWorkspace />
          </main>
        </Show>
      </div>
    </div>
  );
}