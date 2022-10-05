import { gql } from '@apollo/client';

export const BOOK_EVENT = gql`
    mutation BookEvent($eventId: ID!){
        bookEvent(eventId: $eventId) {
            _id
            createdAt
            updatedAt
        }
    }
`;
