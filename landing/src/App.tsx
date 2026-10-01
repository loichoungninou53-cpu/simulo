import Nav from "./components/Nav";
import Hero from "./components/Hero";
import ProductDemo from "./components/ProductDemo";
import HowItWorks from "./components/HowItWorks";
import LocalFirst from "./components/LocalFirst";
import SideBySide from "./components/SideBySide";
import Devices from "./components/Devices";
import UserSpace from "./components/UserSpace";
import Privacy from "./components/Privacy";
import Download from "./components/Download";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--txt)]">
      <Nav />
      <main>
        <Hero />
        <ProductDemo />
        <HowItWorks />
        <LocalFirst />
        <SideBySide />
        <Devices />
        <UserSpace />
        <Privacy />
        <Download />
      </main>
      <Footer />
    </div>
  );
}
