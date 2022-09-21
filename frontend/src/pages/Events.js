import React, { useState } from "react";
import Modal from "../components/modal/Modal";
import Backdrop from "../components/backdrop/Backdrop";

import "./Events.css";

const EventsPage = () => {

    const [creating, setCreating] = useState(false);

    return (
        <>
            {
                creating && (
                    <>
                        <Backdrop />
                        <Modal title="Add Event" canCancel canConfirm onCancel={() => setCreating(false)} onConfirm={() => setCreating(false)}>
                            <p>Modal Content</p>
                        </Modal>
                    </>
                )
            }
            <div className="events-control">
                <p>Share your own Events!</p>
                <button className="btn" onClick={() => setCreating(true)}>Create Event</button>
            </div>
        </>
    )
}

export default EventsPage;