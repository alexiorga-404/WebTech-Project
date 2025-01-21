import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Student = () => {
  const [activity, setActivity] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 

  const joinActivity = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/activities/${accessCode}`);
      setActivity(response.data);
      setErrorMessage('');
      toast.success('Joined activity successfully!');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to join activity. Please check the access code and try again.');
      toast.error(error.response?.data?.error || 'Failed to join activity. Please check the access code and try again.');
    }
  };

  const submitFeedback = async (emoticon) => {
    try {
      const response = await axios.post('http://localhost:5000/api/feedback', {
        activityId: activity.id,
        emoticon,
      });
      setErrorMessage('');
      toast.success('Feedback submitted successfully!');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
      toast.error(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
    }
  };

  // dheck if the activity is active
  const isActivityActive = activity && new Date() >= new Date(activity.startTime) && new Date() <= new Date(activity.endTime);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Student Interface</h1>

      {/* display error messages */}
      {errorMessage && (
        <p className="text-red-500 text-center mb-4">{errorMessage}</p>
      )}

      {/* onput field for access code */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter Access Code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />
        </div>
        <button
          onClick={joinActivity}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Join Activity
        </button>
      </div>

      {/* display activity details and feedback interface */}
      {activity && (
        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Activity: {activity.description}</h2>
          <div className="flex justify-around">
            <button
              onClick={() => submitFeedback('😊')}
              disabled={!isActivityActive}
              className={`text-4xl hover:scale-110 transition-transform ${!isActivityActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              😊
            </button>
            <button
              onClick={() => submitFeedback('😢')}
              disabled={!isActivityActive}
              className={`text-4xl hover:scale-110 transition-transform ${!isActivityActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              😢
            </button>
            <button
              onClick={() => submitFeedback('😮')}
              disabled={!isActivityActive}
              className={`text-4xl hover:scale-110 transition-transform ${!isActivityActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              😮
            </button>
            <button
              onClick={() => submitFeedback('😕')}
              disabled={!isActivityActive}
              className={`text-4xl hover:scale-110 transition-transform ${!isActivityActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              😕
            </button>
          </div>
          {!isActivityActive && (
            <p className="text-red-500 text-center mt-4">
              This activity has ended. Feedback submissions are no longer allowed.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Student;