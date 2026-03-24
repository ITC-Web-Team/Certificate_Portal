import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import MyCertificates from "@/pages/MyCertificates";
import CertificateList from "@/pages/CertificateList";
import CertificateDetails from "@/pages/CertificateDetails";
import LoadCertificate from "@/pages/LoadCertificate";
import UploadSuccess from "@/pages/UploadSuccess";
import Templates from "@/pages/Templates";
import VerifyCertificate from "@/pages/VerifyCertificate";
import AuthRedirect from "@/pages/AuthRedirect";
import AuthCallback from "@/pages/AuthCallback";
import ErrorCallback from "@/pages/ErrorCallback";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/redirect" element={<AuthRedirect />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<ErrorCallback />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/my-certificates" element={<MyCertificates />} />
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/certificates/:id" element={<CertificateDetails />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/load" element={<LoadCertificate />} />
          <Route path="/upload-success/:id" element={<UploadSuccess />} />
        </Route>
      </Route>
      <Route path="/verify/:id/:rollNumber" element={<VerifyCertificate />} />
    </Routes>
  );
}

export default App;
