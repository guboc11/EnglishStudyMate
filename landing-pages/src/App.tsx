import { Routes, Route } from "react-router-dom";
import V1Minimal from "./pages/V1Minimal";
import V2Emotional from "./pages/V2Emotional";
import V3Bold from "./pages/V3Bold";
import ChatPrototype from "./pages/prototypes/v1/ChatPrototype";
import WorkPrototype from "./pages/prototypes/v1/WorkPrototype";
import LecturePrototype from "./pages/prototypes/v1/LecturePrototype";
import FlashcardPrototype from "./pages/prototypes/v1/FlashcardPrototype";
import ChatPrototypeV2 from "./pages/prototypes/v2/ChatPrototypeV2";
import WorkPrototypeV2 from "./pages/prototypes/v2/WorkPrototypeV2";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<V1Minimal />} />
      <Route path="/v2" element={<V2Emotional />} />
      <Route path="/v3" element={<V3Bold />} />
      <Route path="/prototype/v1/chat" element={<ChatPrototype />} />
      <Route path="/prototype/v1/work" element={<WorkPrototype />} />
      <Route path="/prototype/v1/lecture" element={<LecturePrototype />} />
      <Route path="/prototype/v1/flashcard" element={<FlashcardPrototype />} />
      <Route path="/prototype/v2/chat" element={<ChatPrototypeV2 />} />
      <Route path="/prototype/v2/work" element={<WorkPrototypeV2 />} />
    </Routes>
  );
}
