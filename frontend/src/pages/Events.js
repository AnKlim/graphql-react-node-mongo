import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "../components/modal/Modal";
import Backdrop from "../components/backdrop/Backdrop";
import AuthContext from "../context/auth-context";

import "./Events.css";

const EventsPage = () => {
    const title = useRef('');
    const price = useRef('');
    const date = useRef('');
    const description = useRef('');
    const context = useContext(AuthContext);
    const [creating, setCreating] = useState(false);
    const [events, setEvents] = useState([]);

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
                mutation {
                    createEvent(eventInput: {title: "${titleValue}", description: "${descriptionValue}", price: ${priceValue}, date: "${dateValue}"}) {
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
            fetchEvents();
        }).catch(err => {
            console.log(err);
        })
    };

    const fetchEvents = () => {
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
            fetchEvents();
            const events = resData.data.events;
            setEvents(events);
        }).catch(err => {
            console.log(err);
        })
    };

    const eventList = events.map(event => {
        return (
          <li key={event._id} className="events__list-item">
            {event.title}
          </li>
        );
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <>
            {
                creating && (
                    <>
                        <Backdrop />
                        <Modal title="Add Event" canCancel canConfirm onCancel={() => setCreating(false)} onConfirm={() => modalConfirmHandler()}>
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
            {
                context.token && 
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={() => setCreating(true)}>Create Event</button>
                    </div>
            }
            <ul className="events__list">{eventList}</ul>
        </>
    )
}

export default EventsPage;