import { Form, Link, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { resetPassword } from "../utils/authServer";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords are not the same.");
      return;
    }

    const result = await resetPassword(token, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);

    setTimeout(() => {
      navigate(`${import.meta.env.BASE_URL}`);
    }, 150);
  }

  return (
    <>
      <div className="section--logo">
        <img
          className="img--logo"
          src={import.meta.env.BASE_URL + "logo.svg"}
          alt="BerryCam logo"
        />
        <p className="p--logo">BerryCam</p>
      </div>

      <h1 className="section--title__big">New password</h1>

      <Form className="auth--form" onSubmit={handleSubmit}>
        <label>New password</label>
        <input name="password" type="password" minLength={8} required />

        <label>Confirm password</label>
        <input name="confirmPassword" type="password" minLength={8} required />

        {error && <p className="auth--error">{error}</p>}
        {message && <p className="auth--success">{message}</p>}

        <button type="submit">Update password</button>
      </Form>

      <div className="auth--links">
        <Link to={`${import.meta.env.BASE_URL}`}>Back to login</Link>
      </div>
    </>
  );
}