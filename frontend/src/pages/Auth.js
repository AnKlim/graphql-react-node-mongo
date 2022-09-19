import React, { useRef, useState } from "react";

import "./Auth.css";

const AuthPage = () => {

    const [isLogin, setLogin] = useState(true);
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
                query {
                    login(email: "${emailValue}", password: "${passwordValue}") {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `
        };

        if(!isLogin) {
            requestBody = {
                query: `
                    mutation {
                        createUser(userInput: {email: "${emailValue}", password: "${passwordValue}"}) {
                            _id
                            email
                        }
                    }
                `
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
            return res.json();
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