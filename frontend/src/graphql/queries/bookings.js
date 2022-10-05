import { gql } from '@apollo/client';

export const BOOKINGS = gql`
    query {
        bookings {
            _id
            createdAt
            event {
                _id
                title
                date
                price
            }
        }
    }
`;
