import React, { useState, useEffect } from "react";
import axios from "axios";
import FileUpload from "./FileUpload";

export default function StudentForm({ selected, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    studentImage: null,
    motherImage: null,
    fatherImage: null,
  });

  useEffect(() => {
    if (selected) {
      setFormData({
        name: selected.name,
        rollNo: selected.rollNo,
        studentImage: null,
        motherImage: null,
        fatherImage: null,
      });
    }
  }, [selected]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (name, file) => {
    setFormData({ ...formData, [name]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("rollNo", formData.rollNo);
    ["studentImage", "motherImage", "fatherImage"].forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    const url = selected
      ? `http://localhost:5000/students/${selected._id}`
      : "http://localhost:5000/students";

    const method = selected ? "put" : "post";

    const res = await axios[method](url, data);
    onSave(res.data.student);
    setFormData({
      name: "",
      rollNo: "",
      studentImage: null,
      motherImage: null,
      fatherImage: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded mb-4">
      <h5>{selected ? "Edit Student" : "Add Student"}</h5>
      <input
        className="form-control mb-2"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      <input
        className="form-control mb-2"
        name="rollNo"
        value={formData.rollNo}
        onChange={handleChange}
        placeholder="Roll No"
        required
      />

      <FileUpload
        label="Student Image"
        name="studentImage"
        onChange={handleFileChange}
      />
      <FileUpload
        label="Mother Image"
        name="motherImage"
        onChange={handleFileChange}
      />
      <FileUpload
        label="Father Image"
        name="fatherImage"
        onChange={handleFileChange}
      />

      <button className="btn btn-primary mt-3" type="submit">
        Save
      </button>
    </form>
  );
}
