import React from 'react';
import HeroSection from '@/components/landingPage/heroSection';
import BenefitSection from '@/components/landingPage/pages/benefitSection';
import WhatWeOfferSection from '@/components/landingPage/whatWeOffer';

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhatWeOfferSection />
      <BenefitSection />
    </>
  );
}
