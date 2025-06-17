// src/App.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./page/Login";
import Register from "./page/Register";
import RegisterInfoForm from "./page/RegisterInfo";
import RegisterSuccess from "./page/RegisterSuccess.tsx"; 

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-info" element={<RegisterInfoForm />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
