import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/auth-context";
import Spinner from "../components/spinner/Spinner";
import BookingList from "../components/bookings/bookingList/BookingList";
import BookingsChart from '../components/bookings/bookingChart/BookingChart';
import BookingsControls from '../components/bookings/bookingControl/BookingControl';

const BookingsPage = () => {

    const context = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [outputType, setOutputType] = useState('list');

    const fetchBookings = () => {
        setLoading(true);
        const requestBody = {
            query: `
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
            `
        };
        
        fetch("http://localhost:8000/graphql", {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + context.token
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            console.log(res);
            return res.json();
        }).then(resData => {
            const bookings = resData.data.bookings;
            setBookings(bookings);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            setLoading(false);
        })
    };

    const deleteBookingHandler = bookingId => {
        setLoading(true);
        const requestBody = {
          query: `
              mutation CancelBooking($id: ID!) {
                cancelBooking(bookingId: $id) {
                _id
                 title
                }
              }
            `,
            variables: {
                id: bookingId
            }
        };
    
        fetch('http://localhost:8000/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + context.token
          }
        })
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
            return res.json();
          })
          .then(resData => {
            const updatedBookings = bookings.filter(booking => {
                return booking._id !== bookingId;
            });
            setBookings(updatedBookings);
            setLoading(false);
        })
          .catch(err => {
            console.log(err);
            setLoading(false);
        });
    };

    const changeOutputTypeHandler = outputType => {
        if (outputType === 'list') {
            setOutputType('list')
        } else {
            setOutputType('chart')
        }
      };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <>
            { isLoading && <Spinner /> }
            { !isLoading && 
            <>
                <BookingsControls
                    activeOutputType={outputType}
                    onChange={changeOutputTypeHandler}
                />
                <div>
                    {outputType === 'list' ? (
                        <BookingList
                            bookings={bookings}
                            onDelete={deleteBookingHandler}
                        />
                    ) : (
                        <BookingsChart bookings={bookings} />
                    )}
                </div>
            </>
            }
        </>
    )
}

export default BookingsPage;