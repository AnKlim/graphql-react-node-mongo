import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "../components/modal/Modal";
import Backdrop from "../components/backdrop/Backdrop";
import Spinner from "../components/spinner/Spinner";
import AuthContext from "../context/auth-context";
import EventList from "../components/events/eventList/EventList";
import { useQuery, useMutation } from '@apollo/client';
import { EVENTS } from "../graphql/queries/events";

import "./Events.css";
import { BOOK_EVENT } from "../graphql/mutations/bookEvent";
import { CREATE_EVENT } from "../graphql/mutations/createEvent";

const EventsPage = () => {
    const title = useRef('');
    const price = useRef('');
    const date = useRef('');
    const description = useRef('');
    const context = useContext(AuthContext);
    const [creating, setCreating] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { loading: eventLoading, data, refetch } = useQuery(EVENTS);
    const [bookEvent, { loading: bookingLoading }] = useMutation(BOOK_EVENT, {
        context: {
            headers: {
                'Authorization': 'Bearer ' + context.token
            }
        }
    });
    const [createEvent, { loading: creationLoading }] = useMutation(CREATE_EVENT, {
        context: {
            headers: {
                'Authorization': 'Bearer ' + context.token
            }
        }
    });

    const modalCancelHandler = () => {
        setCreating(false);
        setSelectedEvent(null);
    };

    const modalConfirmHandler = async () => {
        setCreating(false);
        const titleValue = title?.current.value;
        const priceValue = +price?.current.value;
        const dateValue = date?.current.value;
        const descriptionValue = description?.current.value;
        if(!titleValue.length || priceValue <= 0 || !dateValue.length || !descriptionValue.length) {
            return;
        }
        
        try {
            await createEvent({ variables: { title: titleValue, description: descriptionValue, price: priceValue, date: dateValue } });
            setSelectedEvent(null);
            refetch();
        } catch (err) {
            console.log(err);
        }
    };

    const showDetailsHander = eventId => {
        setSelectedEvent(data.events.find(e => e._id === eventId));
    };

    const bookEventHandler = async () => {
        if(!context.token) {
            setSelectedEvent(null);
            return;
        }
        try {
            await bookEvent({ variables: { eventId: selectedEvent._id } });
            setSelectedEvent(null);
        } catch (err) {
            console.log(err);
        }
    };

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
                <>
                    <Backdrop />
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
                </>
            )}
            {
                context.token && 
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={() => setCreating(true)}>Create Event</button>
                    </div>
            }
            {
                eventLoading || bookingLoading || creationLoading ? <Spinner /> : <EventList events={data.events} authUserId={context.userId} onViewDetail={showDetailsHander} />
            }
        </>
    )
}

export default EventsPage;