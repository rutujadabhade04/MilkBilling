import React, { useEffect, useState } from "react";
import axios from "axios";
import FileUpload from "./components_r/FileUpload";

const EditStudentImages = ({ studentId }) => {
  const [student, setStudent] = useState({
    studentImageName: "",
    motherImageName: "",
    fatherImageName: "",
    studentImage: null,
    motherImage: null,
    fatherImage: null,
  });

  const fetchStudent = async () => {
    const res = await axios.get(`http://localhost:5000/students/${studentId}`);
    setStudent((prev) => ({
      ...prev,
      studentImageName: res.data.studentImageName,
      motherImageName: res.data.motherImageName,
      fatherImageName: res.data.fatherImageName,
    }));
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const handleFileSelect = (fieldName, file) => {
    setStudent((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (student.studentImage)
      formData.append("studentImage", student.studentImage);
    if (student.motherImage)
      formData.append("motherImage", student.motherImage);
    if (student.fatherImage)
      formData.append("fatherImage", student.fatherImage);

    formData.append("oldStudentImageName", student.studentImageName);
    formData.append("oldMotherImageName", student.motherImageName);
    formData.append("oldFatherImageName", student.fatherImageName);

    try {
      const res = await axios.put(
        `http://localhost:5000/students/${studentId}/upload`,
        formData
      );

      alert("Updated successfully");
      setStudent((prev) => ({
        ...prev,
        studentImageName: res.data.files.studentImage || prev.studentImageName,
        motherImageName: res.data.files.motherImage || prev.motherImageName,
        fatherImageName: res.data.files.fatherImage || prev.fatherImageName,
        studentImage: null,
        motherImage: null,
        fatherImage: null,
      }));
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const imageBaseUrl = "http://localhost:5000/uploads";

  return (
    <div className="container mt-4">
      <h3>Edit Student Images</h3>
      <form onSubmit={handleSubmit}>
        <p>Current Images:</p>
        <div className="row mb-3">
          <div className="col-md-4">
            <p>Student:</p>
            {student.studentImageName && (
              <img
                src={`${imageBaseUrl}/${student.studentImageName}`}
                className="img-thumbnail"
              />
            )}
          </div>
          <div className="col-md-4">
            <p>Mother:</p>
            {student.motherImageName && (
              <img
                src={`${imageBaseUrl}/${student.motherImageName}`}
                className="img-thumbnail"
              />
            )}
          </div>
          <div className="col-md-4">
            <p>Father:</p>
            {student.fatherImageName && (
              <img
                src={`${imageBaseUrl}/${student.fatherImageName}`}
                className="img-thumbnail"
              />
            )}
          </div>
        </div>

        <FileUpload
          label="Update Student Image"
          fieldName="studentImage"
          onFileSelect={handleFileSelect}
        />
        <FileUpload
          label="Update Mother's Image"
          fieldName="motherImage"
          onFileSelect={handleFileSelect}
        />
        <FileUpload
          label="Update Father's Image"
          fieldName="fatherImage"
          onFileSelect={handleFileSelect}
        />

        <button type="submit" className="btn btn-success mt-3">
          Update Images
        </button>
      </form>
    </div>
  );
};

export default EditStudentImages;
