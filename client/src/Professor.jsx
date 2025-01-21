import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000'); // connect to    server

const Professor = () => {
  const [activity, setActivity] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [description, setDescription] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activities, setActivities] = useState([]); // activity history


  const createActivity = async () => {
    // input validation
    if (!description || !accessCode || !startTime || !endTime) {
      toast.error('Please fill out all fields.');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      toast.error('End time must be after start time.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/activities', {
        description,
        accessCode,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
      setActivity(response.data);
      toast.success('Activity created successfully!');
      fetchActivities(); // refresh the activity history
    } catch (error) {
      console.error('Error creating activity:', error);
      //access code duplicat
      if (
        error.response &&
        error.response.data &&
        error.response.data.error === 'Activity with this access code already exists'
      ) {
        toast.error('Code already used. Please use a different access code.');
      } else {
        // Generic error message for other errors
        toast.error('Failed to create activity. Please check the inputs and try again.');
      }
    }
  };

  //fetch feedback for the current activity
  const fetchFeedback = async () => {
    if (activity) {
      const response = await axios.get(`http://localhost:5000/api/feedback/${activity.id}`);
      setFeedback(response.data);
    }
  };

  //  fetch all activities (activity history)
  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // fetch all activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  // fetch feedback when the activity changes
  useEffect(() => {
    if (activity) {
      fetchFeedback();
    }
  }, [activity]);

  // listen for new feedback from the websocket server
  useEffect(() => {
    socket.on('newFeedback', (newFeedback) => {
      // only add the feedback if it belongs to the current activity
      if (newFeedback.activityId === activity?.id) {
        setFeedback((prev) => [...prev, newFeedback]);
      }

       // ppdate all activities in real time!
       setActivities((prevActivities) =>
        prevActivities.map((act) =>
          act.id === newFeedback.activityId
            ? { ...act, Feedbacks: [...(act.Feedbacks || []), newFeedback] } // add new feedback
            : act 
        )
      );
      
    });

    // clean up the websocket listener when the component unmounts
    return () => {
      socket.off('newFeedback');
    };
  }, [activity]); // re-run this effect if the activity changes

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Professor Interface</h1>

      {/* input fields for defining the activity */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter activity description"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Access Code:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md mt-1"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Enter access code"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Time:</label>
          <input
            type="datetime-local"
            className="w-full p-2 border border-gray-300 rounded-md mt-1"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">End Time:</label>
          <input
            type="datetime-local"
            className="w-full p-2 border border-gray-300 rounded-md mt-1"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* button to create the activity */}
        <button
          onClick={createActivity}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Create Activity
        </button>
      </div>

      {/* display activity details and feedback */}
      {activity && (
        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Activity: {activity.description}</h2>
          <h3 className="text-xl font-semibold mb-4">Feedback:</h3>
          <ul>
            {feedback.map((fb) => (
              <li key={fb.id} className="mb-2">
                <span className="text-lg">{fb.emoticon}</span> -{' '}
                <span className="text-gray-600">{new Date(fb.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/*display activity history */}
      <div className="mt-8 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Activity History</h2>
        {activities.map((act) => (
          <div key={act.id} className="mb-6 border-b pb-4">
            <h3 className="text-xl font-semibold">{act.description}</h3>
            <p className="text-gray-600">
              {new Date(act.startTime).toLocaleString()} - {new Date(act.endTime).toLocaleString()}
            </p>
            <h4 className="text-lg font-medium mt-2">Feedback:</h4>
            <ul>
              {act.Feedbacks && act.Feedbacks.map((fb) => (
                <li key={fb.id} className="ml-4">
                  <span className="text-lg">{fb.emoticon}</span> -{' '}
                  <span className="text-gray-600">{new Date(fb.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Professor;