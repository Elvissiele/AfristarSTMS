import prisma from '../config/prisma.js';

export const getContent = async (req, res) => {
    try {
        const content = await prisma.websiteContent.findMany();
        // Transform into key-value object for easier frontend consumption
        const contentMap = {};
        content.forEach(item => {
            contentMap[item.key] = {
                value: item.value,
                imageUrl: item.imageUrl
            };
        });
        res.json(contentMap);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
};
