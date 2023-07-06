import { Context } from "@/components/Context";
import { auth } from "@/utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useContext, useState } from "react";

export default function SignUp() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    pass1: "",
    pass2: "",
    type: "",
  });
  const { user, setUser, setUsers } = useContext(Context);
  const signup = () => {
    if (formValues.pass1 === formValues.pass2) {
      createUserWithEmailAndPassword(auth, formValues.email, formValues.pass1)
        .then(async (userCredential) => {
          // Signed in
          const user = userCredential.user;
          await fetch("/api/addUser", {
            method: "POST",
            body: JSON.stringify({
              ...user,
              displayName: formValues.name,
              displayType: formValues.type,
            }),
          });
          setUsers((pre) => [
            ...pre,
            {
              ...user,
              displayName: formValues.name,
              displayType: formValues.type,
            },
          ]);
          setUser(user);
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
            required='required'
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
            required='required'
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

        <div className="flex gap-x-2 items-center">
          <input
            type="radio"
            id="seller"
            name="type"
            value={"Seller"}
            onChange={(e) =>
              setFormValues((pre) => ({ ...pre, type: e.target.value }))
            }
          ></input>
          <label for="seller">Seller</label>

          <input
            type="radio"
            id="buyer"
            name="type"
            value={"Buyer"}
            onChange={(e) =>
              setFormValues((pre) => ({ ...pre, type: e.target.value }))
            }
          ></input>
          <label for="buyer">Buyer</label>
        </div>

        <div className="border px-2 w-fit border-[#000]">
          <button onClick={signup}>Submit</button>
        </div>
        <Link href={"SignIn"} className="border px-2 w-fit border-[#000] mt-2">
          Back to SignIn
        </Link>
      </div>
    </div>
  );
}
