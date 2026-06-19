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
import Medication from "@/pages/Medication";
import { MedicationReminderProvider } from "@/components/medication/MedicationReminderContext";

export default function App() {
  return (
    <Router>
      <MedicationReminderProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teen" element={<Teen />} />
            <Route path="/career" element={<Career />} />
            <Route path="/pregnancy-prep" element={<PregnancyPrep />} />
            <Route path="/pregnancy" element={<Pregnancy />} />
            <Route path="/postpartum" element={<Postpartum />} />
            <Route path="/relief" element={<Relief />} />
            <Route path="/medication" element={<Medication />} />
            <Route path="/mood" element={<Mood />} />
            <Route path="/menopause" element={<MenopauseCare />} />
          </Routes>
        </Layout>
      </MedicationReminderProvider>
    </Router>
  );
}
