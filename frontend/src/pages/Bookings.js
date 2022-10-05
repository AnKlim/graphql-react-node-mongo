import React, { useContext, useState } from "react";
import AuthContext from "../context/auth-context";
import Spinner from "../components/spinner/Spinner";
import BookingList from "../components/bookings/bookingList/BookingList";
import BookingsChart from '../components/bookings/bookingChart/BookingChart';
import BookingsControls from '../components/bookings/bookingControl/BookingControl';
import { useQuery, useMutation } from '@apollo/client';
import { BOOKINGS } from "../graphql/queries/bookings";
import { CANCEL_BOOKING } from "../graphql/mutations/cancelBooking";

const BookingsPage = () => {

    const context = useContext(AuthContext);
    const [outputType, setOutputType] = useState('list');
    const { loading: bookingsLoading, data, refetch } = useQuery(BOOKINGS, {
        fetchPolicy: "network-only",
        context: {
            headers: {
                'Authorization': 'Bearer ' + context.token
            }
        }
    });
    const [cancelBooking, { loading: cancelationLoading }] = useMutation(CANCEL_BOOKING, {
        context: {
            headers: {
                'Authorization': 'Bearer ' + context.token
            }
        }
    });

    const deleteBookingHandler = async bookingId => {
        try {
            await cancelBooking({ variables: { id: bookingId } });
            refetch();
        } catch (err) {
            console.log(err);
        }
    };

    const changeOutputTypeHandler = outputType => {
        if (outputType === 'list') {
            setOutputType('list')
        } else {
            setOutputType('chart')
        }
    };

    return (
        <>
            { (bookingsLoading || cancelationLoading) && <Spinner /> }
            { !(bookingsLoading || cancelationLoading) && 
            <>
                <BookingsControls
                    activeOutputType={outputType}
                    onChange={changeOutputTypeHandler}
                />
                <div>
                    {outputType === 'list' ? (
                        <BookingList
                            bookings={data.bookings}
                            onDelete={deleteBookingHandler}
                        />
                    ) : (
                        <BookingsChart bookings={data.bookings} />
                    )}
                </div>
            </>
            }
        </>
    )
}

export default BookingsPage;