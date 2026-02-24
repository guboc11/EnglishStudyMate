import { Routes, Route } from "react-router-dom";
import V1Minimal from "./pages/V1Minimal";
import V2Emotional from "./pages/V2Emotional";
import V3Bold from "./pages/V3Bold";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<V1Minimal />} />
      <Route path="/v2" element={<V2Emotional />} />
      <Route path="/v3" element={<V3Bold />} />
    </Routes>
  );
}
