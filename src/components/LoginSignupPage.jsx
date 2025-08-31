import axios from "axios";
import { useState } from "react";

export default function LoginSignupPage(props) {
  let emptyForm = {
    name: "",
    emailId: "",
    password: "",
    role:"",
    confirmPassword: "",
  };
  const [formData, setFormData] = useState(emptyForm);
  let [message, setMessage] = useState("");
  let [status, setStatus] = useState("checkEmail");
  const [formType, setFormType] = useState("login");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.emailId) newErrors.emailId = "Email is required";
    if (formType === "signup" && !formData.name)
      newErrors.emailId = "Name is required";
    if (formType === "signup" && status == "checkEmail") {
      return true;
    }
    if ((formType === "login" || formType === "signup") && !formData.password) {
      newErrors.password = "Password is required";
    }
    if (
      formType === "signup" &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  async function handleSignupFormSubmit() {
    try {
      let response = await axios.post(
        import.meta.env.VITE_API_URL + "/users/signup",
        formData
      );
      showMessage(response.data.message);
      setFormData(emptyForm);
    } catch (error) {
      //try
      console.log(error.response.data);

      if (error.response) {
        // Backend responded with 4xx or 5xx
        showMessage(error.response.data.error);
      } else if (error.request) {
        showMessage("No response from server");
      } else {
        // Something else went wrong
        showMessage("Unexpected error occurred");
      }
    }
  }


  async function handleLoginFormSubmit() {
    try {
      let response = await axios.post(
        import.meta.env.VITE_API_URL + "/users/login",
        formData
      );
      showMessage(response.data.message);
      props.setLoggedinUser(response.data.user);

    console.log("LOGIN RESPONSE:", response.data); // 👈 debug


      // if (user.role === "owner") {
      //   window.location.href = "/ownerpannel";
      // } else {
      //   window.location.href = `/${user.name}`;
      // }



    } catch (error) {
      console.log(error.response.data);
      if (error.response) {
        // Backend responded with 4xx or 5xx
        showMessage(error.response.data.error);
      } else if (error.request) {
        showMessage("No response from server");
      } else {
        // Something else went wrong
        showMessage("Unexpected error occurred");
      }
    }
  }
  async function handleLoginFormSubmit() {
    try {
      let response = await axios.post(
        import.meta.env.VITE_API_URL + "/users/login",
        formData
      );
  
      const { user, message } = response.data; 
      showMessage(message);
      props.setLoggedinUser(user);
  
      console.log("LOGIN RESPONSE:", user);
  
      if (user.role === "owner") {
        window.location.href = "/ownerpanel"; 
      } else {
        window.location.href = `/${user.name}`;
      }
  
    } catch (error) {
      console.log(error.response?.data);
  
      if (error.response) {
        showMessage(error.response.data.error);
      } else if (error.request) {
        showMessage("No response from server");
      } else {
        showMessage("Unexpected error occurred");
      }
    }
  }
  
  function showMessage(m) {
    setMessage(m);
    window.setTimeout(() => {
      setMessage("");
    }, 5000);
  }
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;
    // console.log(formData);
    if (formType == "signup") {
      // check whether user is added by the admin or not.
      handleSignupFormSubmit();
    } else if (formType === "login") {
      handleLoginFormSubmit();
    }
  };
  function handleCloseLoginSignupPageClose() {
    props.onCloseLoginSignupPageClose();
  }
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow w-100" style={{ maxWidth: "400px" }}>
        <div className="card-body">
          <div className="text-end">
            <button onClick={handleCloseLoginSignupPageClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="text-center text-danger my-3">{message}</div>
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li
              className="nav-item"
              onClick={() => {
                setFormType("login");
              }}
            >
              <button className={`nav-link ${formType === "login"}`}>
                Login
              </button>
            </li>
            <li
              className="nav-item"
              onClick={() => {
                setFormType("signup");
                setFormData({ ...formData, password: "", confirmPassword: "" });
              }}
            >
              <button
                className={`nav-link ${formType === "signup" ? "active" : ""}`}
              >
                Signup
              </button>
            </li>
          </ul>

          {formType === "login" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  name="emailId"
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  onChange={handleChange}
                />
                {errors.emailId && (
                  <div className="text-danger mt-1 small">{errors.emailId}</div>
                )}
              </div>
              <div className="mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  onChange={handleChange}
                />
                {errors.password && (
                  <div className="text-danger mt-1 small">
                    {errors.password}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>
          )}
          {formType === "signup" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="Your name"
                  onChange={handleChange}
                />
                {errors.name && (
                  <div className="text-danger mt-1 small">{errors.name}</div>
                )}
              </div>
              <div className="mb-3">
                <input
                  name="emailId"
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  onChange={handleChange}
                />
                {errors.emailId && (
                  <div className="text-danger mt-1 small">{errors.emailId}</div>
                )}
              </div>
              <div className="mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  onChange={handleChange}
                />
                {errors.password && (
                  <div className="text-danger mt-1 small">
                    {errors.password}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <input
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <div className="text-danger mt-1 small">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-dark w-100">
                Signup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
