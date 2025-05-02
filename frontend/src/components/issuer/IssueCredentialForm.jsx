// src/components/issuer/IssueCredentialForm.jsx
import React, { useState } from "react";
import IPFSService from "../../services/IPFSService";

const IssueCredentialForm = ({ contractService, onCredentialIssued }) => {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    recipientAddress: "",
    title: "",
    issuerName: "",
    isPublic: true,
    expiryDate: "",
    credentialType: "education", // Default type
    credentialData: {},
  });

  // Dynamic fields based on credential type
  const [dynamicFields, setDynamicFields] = useState([
    { name: "institution", label: "Institution", value: "", type: "text" },
    { name: "degree", label: "Degree/Certificate", value: "", type: "text" },
    { name: "dateAwarded", label: "Date Awarded", value: "", type: "date" },
  ]);

  const [fileUpload, setFileUpload] = useState(null);
  const ipfsService = new IPFSService();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDynamicFieldChange = (index, value) => {
    const updatedFields = [...dynamicFields];
    updatedFields[index].value = value;
    setDynamicFields(updatedFields);

    // Update credential data
    const fieldData = {};
    dynamicFields.forEach((field) => {
      fieldData[field.name] = field.value;
    });

    setFormValues({
      ...formValues,
      credentialData: fieldData,
    });
  };

  const handleCredentialTypeChange = (e) => {
    const type = e.target.value;
    setFormValues({
      ...formValues,
      credentialType: type,
    });

    // Update dynamic fields based on credential type
    switch (type) {
      case "education":
        setDynamicFields([
          {
            name: "institution",
            label: "Institution",
            value: "",
            type: "text",
          },
          {
            name: "degree",
            label: "Degree/Certificate",
            value: "",
            type: "text",
          },
          {
            name: "dateAwarded",
            label: "Date Awarded",
            value: "",
            type: "date",
          },
        ]);
        break;
      case "employment":
        setDynamicFields([
          { name: "company", label: "Company", value: "", type: "text" },
          { name: "position", label: "Position", value: "", type: "text" },
          { name: "startDate", label: "Start Date", value: "", type: "date" },
          {
            name: "endDate",
            label: "End Date (leave blank if current)",
            value: "",
            type: "date",
          },
        ]);
        break;
      case "identity":
        setDynamicFields([
          { name: "fullName", label: "Full Name", value: "", type: "text" },
          {
            name: "dateOfBirth",
            label: "Date of Birth",
            value: "",
            type: "date",
          },
          {
            name: "nationalId",
            label: "National ID Number",
            value: "",
            type: "text",
          },
        ]);
        break;
      case "custom":
        setDynamicFields([
          { name: "field1", label: "Custom Field 1", value: "", type: "text" },
          { name: "field2", label: "Custom Field 2", value: "", type: "text" },
        ]);
        break;
      default:
        setDynamicFields([]);
    }
  };

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const addCustomField = () => {
    const fieldName = prompt("Enter field name:");
    if (fieldName) {
      setDynamicFields([
        ...dynamicFields,
        {
          name: fieldName.toLowerCase().replace(/\s/g, "_"),
          label: fieldName,
          value: "",
          type: "text",
        },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Build credential data object
      const credentialData = {
        type: formValues.credentialType,
        title: formValues.title,
        issuer: formValues.issuerName,
        timestamp: Date.now(),
        ...formValues.credentialData,
      };

      // 2. Upload to IPFS
      let ipfsHash;

      if (fileUpload) {
        // If there's a file, upload it first and include its hash in the metadata
        const fileHash = await ipfsService.uploadFile(fileUpload);
        credentialData.documentHash = fileHash;
      }

      // Upload the credential data
      ipfsHash = await ipfsService.uploadCredentialJSON(credentialData);

      // 3. Issue credential on blockchain
      const expiresAt = formValues.expiryDate
        ? new Date(formValues.expiryDate).getTime() / 1000
        : 0;

      await contractService.issueCredential(
        formValues.recipientAddress,
        formValues.title,
        formValues.issuerName,
        ipfsHash,
        formValues.isPublic,
        expiresAt
      );

      // 4. Reset form and notify parent
      resetForm();
      alert("Credential issued successfully!");

      if (onCredentialIssued) {
        onCredentialIssued();
      }
    } catch (error) {
      console.error("Error issuing credential:", error);
      alert(`Failed to issue credential: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormValues({
      recipientAddress: "",
      title: "",
      issuerName: "",
      isPublic: true,
      expiryDate: "",
      credentialType: "education",
      credentialData: {},
    });

    setDynamicFields([
      { name: "institution", label: "Institution", value: "", type: "text" },
      { name: "degree", label: "Degree/Certificate", value: "", type: "text" },
      { name: "dateAwarded", label: "Date Awarded", value: "", type: "date" },
    ]);

    setFileUpload(null);

    // Reset file input
    const fileInput = document.getElementById("documentUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Issue New Credential</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recipient Address */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address *
            </label>
            <input
              type="text"
              name="recipientAddress"
              value={formValues.recipientAddress}
              onChange={handleInputChange}
              placeholder="0x..."
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Credential Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credential Type *
            </label>
            <select
              name="credentialType"
              value={formValues.credentialType}
              onChange={handleCredentialTypeChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="education">Education</option>
              <option value="employment">Employment</option>
              <option value="identity">Identity</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Credential Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credential Title *
            </label>
            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleInputChange}
              placeholder="Bachelor's Degree, Employment Certificate, etc."
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Issuer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuer Name *
            </label>
            <input
              type="text"
              name="issuerName"
              value={formValues.issuerName}
              onChange={handleInputChange}
              placeholder="University Name, Company Name, etc."
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formValues.expiryDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank if credential never expires
            </p>
          </div>

          {/* Visibility */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formValues.isPublic}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isPublic"
              className="ml-2 block text-sm text-gray-700"
            >
              Make credential publicly viewable
            </label>
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Credential Details</h3>
            {formValues.credentialType === "custom" && (
              <button
                type="button"
                onClick={addCustomField}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                + Add Field
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dynamicFields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) =>
                    handleDynamicFieldChange(index, e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Document Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Supporting Document (Optional)
          </label>
          <input
            type="file"
            id="documentUpload"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a PDF, image, or other document to be stored on IPFS and
            linked to this credential
          </p>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 text-white font-medium rounded-md 
              ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Issuing Credential..." : "Issue Credential"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueCredentialForm;
