import { auth } from "@/utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function SignUp() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    pass1: "",
    pass2: "",
  });
  const router = useRouter();
  const signup = () => {
    if (formValues.pass1 === formValues.pass2) {
      createUserWithEmailAndPassword(auth, formValues.email, formValues.pass1)
        .then(async (userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          await fetch("/api/addUser", {
            method: "POST",
            body: JSON.stringify({ ...user, displayName: formValues.name }),
          });
          router.push("/SignIn?refresh=1");
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
          console.log(error);
        });
    }
  };
  return (
    <div className="flex justify-center items-center w-screen h-screen bg-[#D9D9D9]">
      <div className="flex flex-col p-2">
        <p>Signup</p>
        <div>
          <p>Name</p>
          <input
            placeholder="Enter name"
            value={formValues.name}
            onChange={(e) =>
              setFormValues((pre) => ({ ...pre, name: e.target.value }))
            }
          />
        </div>
        <div>
          <p>Email</p>
          <input
            placeholder="Enter email"
            value={formValues.email}
            onChange={(e) =>
              setFormValues((pre) => ({ ...pre, email: e.target.value }))
            }
          />
        </div>
        <div>
          <p>Password</p>
          <input
            placeholder="Enter password"
            required
            minLength={6}
            max={20}
            value={formValues.pass1}
            onChange={(e) =>
              setFormValues((pre) => ({ ...pre, pass1: e.target.value }))
            }
          />
        </div>
        <div>
          <p>Confirm Password</p>
          <input
            placeholder="Enter confirm password"
            value={formValues.pass2}
            onChange={(e) =>
              setFormValues((pre) => ({ ...pre, pass2: e.target.value }))
            }
          />
        </div>
        <div>
          <button onClick={signup}>Submit</button>
        </div>
        <Link href={"SignIn"}>Back to SignIn</Link>
      </div>
    </div>
  );
}
