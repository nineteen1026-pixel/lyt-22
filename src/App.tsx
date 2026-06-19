import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Teen from "@/pages/Teen";
import Career from "@/pages/Career";
import PregnancyPrep from "@/pages/PregnancyPrep";
import Pregnancy from "@/pages/Pregnancy";
import Postpartum from "@/pages/Postpartum";
import Relief from "@/pages/Relief";
import Mood from "@/pages/Mood";
import MenopauseCare from "@/pages/Menopause";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teen" element={<Teen />} />
          <Route path="/career" element={<Career />} />
          <Route path="/pregnancy-prep" element={<PregnancyPrep />} />
          <Route path="/pregnancy" element={<Pregnancy />} />
          <Route path="/postpartum" element={<Postpartum />} />
          <Route path="/relief" element={<Relief />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/menopause" element={<MenopauseCare />} />
        </Routes>
      </Layout>
    </Router>
  );
}
