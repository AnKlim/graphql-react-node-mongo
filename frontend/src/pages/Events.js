import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "../components/modal/Modal";
import Backdrop from "../components/backdrop/Backdrop";
import Spinner from "../components/spinner/Spinner";
import AuthContext from "../context/auth-context";
import EventList from "../components/events/eventList/EventList";

import "./Events.css";

const EventsPage = () => {
    const title = useRef('');
    const price = useRef('');
    const date = useRef('');
    const description = useRef('');
    const context = useContext(AuthContext);
    const [creating, setCreating] = useState(false);
    const [events, setEvents] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const modalCancelHandler = () => {
        setCreating(false);
        setSelectedEvent(null);
    };

    const modalConfirmHandler = () => {
        setCreating(false);
        const titleValue = title?.current.value;
        const priceValue = +price?.current.value;
        const dateValue = date?.current.value;
        const descriptionValue = description?.current.value;
        if(!titleValue.length || priceValue <= 0 || !dateValue.length || !descriptionValue.length) {
            return;
        }

        const requestBody = {
            query: `
                mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
                    createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
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
            `,
            variables: {
                title: titleValue,
                description: descriptionValue,
                price: priceValue,
                date: dateValue
            }
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
            console.log(resData);
            const updatedEvents = [...events];
                updatedEvents.push({
                  _id: resData.data.createEvent._id,
                  title: resData.data.createEvent.title,
                  description: resData.data.createEvent.description,
                  date: resData.data.createEvent.date,
                  price: resData.data.createEvent.price,
                  creator: {
                    _id: context.userId
                  }
                });
            setEvents(updatedEvents);
        }).catch(err => {
            console.log(err);
        })
    };

    const fetchEvents = () => {
        setLoading(true);
        const requestBody = {
            query: `
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
            `
        };
        
        fetch("http://localhost:8000/graphql", {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            console.log(res);
            return res.json();
        }).then(resData => {
            const events = resData.data.events;
            setEvents(events);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            setLoading(false);
        })
    };

    const showDetailsHander = eventId => {
        setSelectedEvent(events.find(e => e._id === eventId));
    };

    const bookEventHandler = () => {
        if(!context.token) {
            setSelectedEvent(null);
            return;
        }
        setLoading(true);
        const requestBody = {
            query: `
                mutation BookEvent($eventId: ID!){
                    bookEvent(eventId: $eventId) {
                        _id
                        createdAt
                        updatedAt
                    }
                }
            `,
            variables: {
                eventId: selectedEvent._id
            }
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
            const events = resData.data.events;
            setSelectedEvent(null);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            setLoading(false);
        })
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <>
            {
                creating && (
                    <>
                        <Backdrop />
                        <Modal title="Add Event" canCancel canConfirm onCancel={modalCancelHandler} onConfirm={modalConfirmHandler}>
                            <form>
                                <div className="form-control">
                                    <label htmlFor="title">Title</label>
                                    <input type="text" id="title" ref={title}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="price">Price</label>
                                    <input type="text" id="price" ref={price}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="date">Date</label>
                                    <input type="datetime-local" id="date" ref={date}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" rows="4" ref={description}/>
                                </div>
                            </form>
                        </Modal>
                    </>
                )
            }
            {selectedEvent && (
                <Modal
                    title={selectedEvent.title}
                    canCancel
                    canConfirm
                    onCancel={modalCancelHandler}
                    onConfirm={bookEventHandler}
                    confirmText={context.token ? "Book" : "Confirm"}
                >
                    <h1>{selectedEvent.title}</h1>
                    <h2>
                        ${selectedEvent.price} -{' '}
                        {new Date(selectedEvent.date).toLocaleDateString()}
                    </h2>
                    <p>{selectedEvent.description}</p>
                </Modal>
            )}
            {
                context.token && 
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={() => setCreating(true)}>Create Event</button>
                    </div>
            }
            {
                isLoading ? <Spinner /> : <EventList events={events} authUserId={context.userId} onViewDetail={showDetailsHander} />
            }
        </>
    )
}

export default EventsPage;