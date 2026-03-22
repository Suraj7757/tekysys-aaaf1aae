import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const [qrCodes, setQrCodes] = useState([]);

  // Fetch QR codes from the database
  const fetchQRCodes = async () => {
    const { data, error } = await supabase.from("qr_codes").select();
    if (error) {
      alert("Error fetching QR codes.");
    } else {
      setQrCodes(data);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  // Add QR Code
  const handleAddQR = async () => {
    const name = prompt("Enter QR name");
    const upi_id = prompt("Enter UPI ID");
    const image = prompt("Enter QR image URL");
    if (name && upi_id && image) {
      const { error } = await supabase.from("qr_codes").insert([{ name, upi_id, image }]);
      if (error) alert("Error adding QR code.");
      else fetchQRCodes();
    }
  };

  // Edit QR Code
  const handleEditQR = async (id) => {
    const name = prompt("Enter new name");
    const upi_id = prompt("Enter new UPI ID");
    const image = prompt("Enter new image URL");
    if (name && upi_id && image) {
      const { error } = await supabase.from("qr_codes").update({ name, upi_id, image }).eq("id", id);
      if (error) alert("Error updating QR code.");
      else fetchQRCodes();
    }
  };

  // Delete QR Code
  const handleDeleteQR = async (id) => {
    const { error } = await supabase.from("qr_codes").delete().eq("id", id);
    if (error) alert("Error deleting QR code.");
    else fetchQRCodes();
  };

  return (
    <div>
      <h2>QR Code Management</h2>
      <button onClick={handleAddQR}>Add QR</button>
      <div>
        {qrCodes.length > 0 ? (
          <ul>
            {qrCodes.map((qr) => (
              <li key={qr.id}>
                <span>{qr.name}</span> - <span>{qr.upi_id}</span>
                <button onClick={() => handleEditQR(qr.id)}>Edit</button>
                <button onClick={() => handleDeleteQR(qr.id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No QR codes available</p>
        )}
      </div>
    </div>
  );
}
