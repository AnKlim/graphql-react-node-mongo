import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/auth-context";
import Spinner from "../components/spinner/Spinner";

const BookingsPage = () => {

    const context = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setLoading] = useState(false);

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

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <>
            <ul>
                {bookings.map(booking => 
                <li key={booking._id}>
                    {booking.event.title} - {' '}{new Date(booking.createdAt).toLocaleDateString()}
                </li>)}
            </ul>
            {
                isLoading && <Spinner />
            }
        </>
    )
}

export default BookingsPage;