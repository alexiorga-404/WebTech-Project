const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', //all origins can connect,bad practice
  },
});

// middleware
app.use(cors());
app.use(express.json());

// db setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', 
});

//models
const Activity = sequelize.define('Activity', {
  description: { type: DataTypes.STRING, allowNull: false },
  accessCode: { type: DataTypes.STRING, unique: true, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
});

const Feedback = sequelize.define('Feedback', {
  emoticon: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

//relationships
Activity.hasMany(Feedback, { foreignKey: 'activityId', onDelete: 'CASCADE' });
Feedback.belongsTo(Activity, { foreignKey: 'activityId' });

// sync database
sequelize.sync({ force: false }).then(() => { //force drops and recreates all
  console.log('Database synced');             
});

// API Routes
app.post('/api/activities', async (req, res) => {
  try {
    const { description, accessCode, startTime, endTime } = req.body;

    // Check if an activity with the same accessCode already exists
    const existingActivity = await Activity.findOne({ where: { accessCode } });
    if (existingActivity) {
      return res.status(400).json({ error: 'Activity with this access code already exists' });
    }

    // If the accessCode is unique, create the new activity
    const activity = await Activity.create({ description, accessCode, startTime, endTime });
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post('/api/feedback', async (req, res) => {
  try {
    const { activityId, emoticon } = req.body;

    // check if the activity exists
    const activity = await Activity.findByPk(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // check valid startTime and endTime
    if (!activity.startTime || !activity.endTime) {
      return res.status(400).json({ error: 'Activity time range is not set' });
    }

    //check activity deadline
    const now = new Date();
    const startTime = new Date(activity.startTime);
    const endTime = new Date(activity.endTime);

    if (now < startTime || now > endTime) {
      return res.status(400).json({ error: 'Feedback submissions are only allowed during the activity time range' });
    }


    // create feedback
    const feedback = await Feedback.create({ activityId, emoticon });
    io.emit('newFeedback', feedback); // real-time feedback
    
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(400).json({ error: error.message });
  }
});


app.get('/api/activities/:code', async (req, res) => {
  try {
    const activity = await Activity.findOne({ where: { accessCode: req.params.code } });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/feedback/:activityId', async (req, res) => {
  try {
    const feedback = await Feedback.findAll({ where: { activityId: req.params.activityId } });
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.findAll({
      include: [{ model: Feedback, as: 'Feedbacks' }], // include feedback
    });
    res.json(activities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});