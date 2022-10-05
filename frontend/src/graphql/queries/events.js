import { gql } from '@apollo/client';

export const EVENTS = gql`
    query {
        events {
            _id
            title
            description
            date
            price
            creator {
                _id
                email
            }
        }
    }
`;
