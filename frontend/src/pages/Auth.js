import React, { useContext, useRef, useState } from "react";
import { useLazyQuery, useMutation } from '@apollo/client';
import AuthContext from "../context/auth-context";
import { LOGIN } from "../graphql/queries/login";

import "./Auth.css";
import { CREATE_USER } from "../graphql/mutations/createUser";

const AuthPage = () => {

    const [isLogin, setLogin] = useState(true);
    const context = useContext(AuthContext);
    const email = useRef('');
    const password = useRef('');
    const [login] = useLazyQuery(LOGIN);
    const [createUser] = useMutation(CREATE_USER);

    const submitHeader = async event => {
        event && event.preventDefault();
        const emailValue = email?.current.value;
        const passwordValue = password?.current.value;
        if(!emailValue.length || !passwordValue.length) {
            return;
        }

        try {
            let resData;
            if (isLogin) {
                resData = await login({ variables: { email: emailValue, password: passwordValue } });
                if (resData.data.login.token) {
                    context.login(resData.data.login.token, resData.data.login.userId, resData.data.login.tokenExpiration);
                }
                // localStorage.setItem('token', resData.data.login.token);
            } else {
                resData = await createUser({ variables: { email: emailValue, password: passwordValue } });
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <form className="auth-form" onSubmit={submitHeader}>
            <div className="form-control">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" ref={email}></input>
            </div>
            <div className="form-control">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" ref={password}></input>
            </div>
            <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setLogin(!isLogin)}>Switch to {isLogin ? 'Signup' : 'Login'}</button>
            </div>
        </form>
    )
}

export default AuthPage;