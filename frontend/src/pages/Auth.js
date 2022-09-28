import React, { useContext, useRef, useState } from "react";
import AuthContext from "../context/auth-context";

import "./Auth.css";

const AuthPage = () => {

    const [isLogin, setLogin] = useState(true);
    const context = useContext(AuthContext);
    const email = useRef('');
    const password = useRef('');

    const submitHeader = (event) => {
        event && event.preventDefault();
        const emailValue = email?.current.value;
        const passwordValue = password?.current.value;
        if(!emailValue.length || !passwordValue.length) {
            return;
        }

        let requestBody = {
            query: `
                query Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `,
            variables: {
                email: emailValue,
                password: passwordValue
            }
        };

        if(!isLogin) {
            requestBody = {
                query: `
                    mutation CreateUser($email: String!, $password: String!) {
                        createUser(userInput: {email: $email, password: $password}) {
                            _id
                            email
                        }
                    }
                `,
                variables: {
                    email: emailValue,
                    password: passwordValue
                }
            };
        }
        
        fetch("http://localhost:8000/graphql", {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {'Content-Type': 'application/json'}
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            console.log(res);
            return res.json();
        }).then(resData => {
            console.log(resData);
            if(resData.data.login.token) {
                context.login(resData.data.login.token, resData.data.login.userId, resData.data.login.tokenExpiration);
            }
        }).catch(err => {
            console.log(err);
        })
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