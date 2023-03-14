import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async (req, res) => {
    const client = await clientPromise;
    const db = client.db('pocket-pay');
    const collection = db.collection('user');

    try {
        if (req.method !== 'GET')
            return res
                .status(405)
                .json({ message: 'Method not allowed', code: 405 });

        const { email, password } = req.body;

        const user = await collection.findOne({ email });

        if (user === null)
            return res
                .status(400)
                .json({ message: 'Email does not exist', code: 400 });

        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword)
            return res
                .status(400)
                .json({ message: 'Password is incorrect', code: 400 });

        const token = jwt.sign(
            {
                fullName: user.fullName,
                email: user.email,
                id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_SECRET_EXPIRED,
            }
        );

        delete user.password;
        return res.status(200).json({
            message: 'User logged in successfully',
            data: user,
            token,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, code: 500 });
    }
};
//
