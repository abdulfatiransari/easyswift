import { Context } from "@/components/Context";
import { auth } from "@/utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";

export default function SignIn() {
    const { user, setUser } = useContext(Context);
    const [formValues, setFormValues] = useState({
        name: "",
        email: "",
        pass1: "",
        pass2: "",
        type: "",
    });
    const router = useRouter();
    const signin = () => {
        signInWithEmailAndPassword(auth, formValues.email, formValues.pass1)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                setUser(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    };

    return (
        <div className="flex justify-center items-center bg-[#D9D9D9] w-screen h-screen">
            <div className="fle flex-col p-2 ">
                <p>Signin</p>
                <div>
                    <p>Email</p>
                    <input
                        placeholder="Enter email"
                        required
                        value={formValues.email}
                        onChange={(e) => setFormValues((pre) => ({ ...pre, email: e.target.value }))}
                    />
                </div>
                <div>
                    <p>Password</p>
                    <input
                        placeholder="Enter password"
                        required
                        value={formValues.pass1}
                        type="password"
                        onChange={(e) => setFormValues((pre) => ({ ...pre, pass1: e.target.value }))}
                    />
                </div>
                <button onClick={signin}>Submit</button>
                <p>
                    If you do not have account{" "}
                    <Link href={"SignUp"} className="cursor-pointer underline">
                        click here
                    </Link>
                </p>
            </div>
        </div>
    );
}
