import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import CertificateList from "@/pages/CertificateList";
import LoadCertificate from "@/pages/LoadCertificate";
import AuthRedirect from "@/pages/AuthRedirect";
import UploadSuccess from "./pages/UploadSuccess";
import Templates from "./pages/Templates";
import CertificateDetails from "./pages/CertificateDetails";
import VerifyCertificate from "./pages/VerifyCertificate";
import AuthCallback from "@/pages/AuthCallback";
import ErrorCallback from "@/pages/ErrorCallback";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/redirect" element={<AuthRedirect />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<ErrorCallback />} />
      {/* Protected routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/certificates" element={<CertificateList />} />
        <Route path="/load" element={<LoadCertificate />} />
        <Route path="/upload-success/:id" element={<UploadSuccess />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/certificates/:id" element={<CertificateDetails />} />
      </Route>
      <Route path="/verify/:id/:rollNumber" element={<VerifyCertificate />} />
    </Routes>
  );
}

export default App;
