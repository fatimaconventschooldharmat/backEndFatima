import mongoose from 'mongoose';


const contectDB = async () => {

    try {
        mongoose.connection.on('connected', () =>
            console.log('Database connected successfully')
        );
        await mongoose.connect(process.env.MONGODB_URI);

    } catch (error) {
        console.error('Database connection error:', error.message);
    }
}

export default contectDB;