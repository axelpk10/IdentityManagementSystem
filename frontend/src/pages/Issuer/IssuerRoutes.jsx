// src/pages/Issuer/IssuerRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import CreateCredential from "./CreateCredential";
import ManageCredentials from "./ManageCredentials";
import CredentialDetail from "./CredentialDetail";

export default function IssuerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/create" element={<CreateCredential />} />
      <Route path="/manage" element={<ManageCredentials />} />
      <Route
        path="/credential/:userAddress/:index"
        element={<CredentialDetail />}
      />
    </Routes>
  );
}
