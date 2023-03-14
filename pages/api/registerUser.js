import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcrypt';

export default async (req, res) => {
    const client = await clientPromise;
    const db = client.db('pocket-pay');
    const collection = db.collection('user');

    try {
        if (req.method !== 'POST')
            return res
                .status(405)
                .json({ message: 'Method not allowed', code: 405 });

        const { fullName, email, password } = req.body;
        const hashPassowrd = await bcrypt.hash(password, 10);
        const user = await collection.findOne({ email });

        if (user !== null && user.email === email)
            return res
                .status(400)
                .json({ message: 'Email already exists', code: 400 });

        const data = await collection.insertOne({
            fullName,
            email,
            password: hashPassowrd,
            pin: null
        });

        return res.status(200).json({
            message: 'User created successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, code: 500 });
    }
};
//
