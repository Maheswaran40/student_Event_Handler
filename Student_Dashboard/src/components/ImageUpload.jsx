// export default ImageUpload;
import React, { useState } from "react";
import { toast } from "react-toastify";

const ImageUpload = ({ formData, setFormData }) => {
  const [previewUrl, setPreviewUrl] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    //  validation
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max size 5MB");
      return;
    }

    //  preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    //  store file
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
    }));
    console.log("file",file)
  };

  return (
    <div>
      <label>Event Image</label>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="preview"
          style={{ width: "200px", marginBottom: "10px" }}
        />
      )}

      <input type="file" accept="image/*" onChange={handleImageChange} />
    </div>
  );
};

export default ImageUpload;