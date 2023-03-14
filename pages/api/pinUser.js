import clientPromise from '../../lib/mongodb';

export default async (req, res) => {
    const client = await clientPromise;
    const db = client.db('pocket-pay');
    const collection = db.collection('user');

    try {
        if (req.method !== 'GET')
            return res
                .status(405)
                .json({ message: 'Method not allowed', code: 405 });

        const { pin } = req.body;

        if (pin.toString().split('').length !== 6)
            return res
                .status(400)
                .json({ message: 'Pin must be 6 digits', code: 400 });
        const name = req.query;
        const user = await collection.findOne({ fullName: name.user });
        if (user === null)
            return res
                .status(400)
                .json({ message: 'User not found', code: 400 });

        if (user.pin === null) {
            const data = await collection.findOneAndUpdate(
                { fullName: name.user },
                { $set: { pin } }
            );
            return res.status(200).json({
                message: 'Pin created successfully',
                data,
            });
        } else {
            return res.status(200).json({
                message: 'Pin Ready!',
                code: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message, code: 500 });
    }
};
