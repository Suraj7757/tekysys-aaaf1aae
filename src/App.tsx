import Sells from "./pages/Sells";
// ... other imports

function ProtectedRoutes() {
  // ...
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/jobs" element={<RepairJobs />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/settlements" element={<Settlements />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/sells" element={<Sells />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/trash" element={<Trash />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
