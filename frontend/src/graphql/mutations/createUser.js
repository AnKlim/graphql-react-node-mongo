import { gql } from '@apollo/client';

export const CREATE_USER = gql`
    mutation CreateUser($email: String!, $password: String!) {
        createUser(userInput: {email: $email, password: $password}) {
            _id
            email
        }
    }
`;
