import { useState } from "react";
import RegisterForm from "../components/Forms/RegisterForm";

const Register = () => {
  const style = {};

  return (
    <main>
      <div className="flex-row justify-space-between">
        <div className="col-12 mb-3">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
};

export default Register;
