import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentForm from "./StudentForm";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchStudents = async () => {
    const res = await axios.get("http://localhost:5000/students");
    setStudents(res.data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSave = () => {
    fetchStudents();
    setSelected(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this student?")) {
      await axios.delete(`http://localhost:5000/students/${id}`);
      fetchStudents();
    }
  };

  return (
    <div className="container my-4">
      <StudentForm selected={selected} onSave={handleSave} />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Student Image</th>
            <th>Mother</th>
            <th>Father</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.rollNo}</td>
              <td>{s.name}</td>
              <td>
                <img
                  src={`http://localhost:5000/uploads/${s.studentImageName}`}
                  width="50"
                />
              </td>
              <td>
                <img
                  src={`http://localhost:5000/uploads/${s.motherImageName}`}
                  width="50"
                />
              </td>
              <td>
                <img
                  src={`http://localhost:5000/uploads/${s.fatherImageName}`}
                  width="50"
                />
              </td>
              <td>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => setSelected(s)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(s._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
