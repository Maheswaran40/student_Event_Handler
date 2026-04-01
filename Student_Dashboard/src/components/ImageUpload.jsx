// import React, { useState } from 'react';
// import { toast } from 'react-toastify';
// import axios from 'axios';

// const ImageUpload = ({ formData, setFormData, existingImage }) => {
//   const [uploading, setUploading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState(existingImage || '');

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
//     if (!allowedTypes.includes(file.type)) {
//       toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
//       return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error('Image size should be less than 5MB');
//       return;
//     }

//     // Create preview
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setPreviewUrl(reader.result);
//     };
//     reader.readAsDataURL(file);

//     // Upload to Cloudinary
//     setUploading(true);
//     const uploadData = new FormData();
//     uploadData.append('image', file);

//     try {
//       const response = await axios.post('http://localhost:5000/api/upload/image', uploadData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.data.success) {
//         setFormData(prev => ({
//           ...prev,
//           image: response.data.imageUrl
//         }));
//         toast.success('Image uploaded successfully!');
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       toast.error('Failed to upload image');
//       setPreviewUrl(existingImage || '');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleRemoveImage = () => {
//     setPreviewUrl('');
//     setFormData(prev => ({
//       ...prev,
//       image: ''
//     }));
//   };

//   return (
//     <div className="space-y-4">
//       <label className="block text-sm font-medium text-gray-700 mb-2">
//         Event Image
//       </label>
      
//       {/* Preview Section */}
//       {previewUrl && (
//         <div className="relative w-full h-48 mb-4">
//           <img
//             src={previewUrl}
//             alt="Preview"
//             className="w-full h-full object-cover rounded-lg"
//           />
//           <button
//             type="button"
//             onClick={handleRemoveImage}
//             className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//       )}

//       {/* Upload Button */}
//       <div className="flex items-center justify-center w-full">
//         <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
//           <div className="flex flex-col items-center justify-center pt-5 pb-6">
//             <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
//               <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
//             </svg>
//             <p className="mb-2 text-sm text-gray-500">
//               <span className="font-semibold">Click to upload</span> or drag and drop
//             </p>
//             <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
//           </div>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageUpload}
//             disabled={uploading}
//             className="hidden"
//           />
//         </label>
//       </div>
      
//       {uploading && (
//         <div className="flex justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       )}
      
//       {/* Display current image URL if exists */}
//       {formData.image && !previewUrl && (
//         <div className="text-sm text-gray-500">
//           Current image URL: <a href={formData.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.image}</a>
//         </div>
//       )}
//     </div>
//   );
// };

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