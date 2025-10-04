import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { CategorySelector } from './CategorySelector';
import { Newsletter } from './Newsletter';
import { Button } from './ui/button';
import { useRouter } from './Router';

export function HomePage() {
  const { navigateTo } = useRouter();

  return (
    <div className="min-h-screen bg-elbfunkeln-beige">
      <div className="relative z-10">
        <HeroSection />
        <AboutSection />
        <CategorySelector />
        <Newsletter />
      </div>
    </div>
  );
}