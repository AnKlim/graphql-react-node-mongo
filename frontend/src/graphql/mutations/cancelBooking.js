import { gql } from '@apollo/client';

export const CANCEL_BOOKING = gql`
    mutation CancelBooking($id: ID!) {
        cancelBooking(bookingId: $id) {
            _id
            title
        }
    }
`;
