import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { authRoutes } from './controllers/authController';
import { dataRoutes } from './controllers/dataController';
import { config } from './config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});