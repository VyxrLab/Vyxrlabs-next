import Hero from "./components/hero/Hero";
import LogoMarquee from "./components/home/LogoMarquee";
import Statement from "./components/home/Statement";
import ServicesList from "./components/home/ServicesList";
import About from "./components/home/About";
import BlackSwan from "./components/work/BlackSwan";
import Testimonials from "./components/testimonials/Testimonials";
import CtaBand from "./components/sections/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <Statement />
      <ServicesList />
      <BlackSwan />
      <Testimonials />
      <About />
      <CtaBand />
    </>
  );
}
