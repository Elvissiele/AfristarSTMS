import { getModelByName } from '@adminjs/prisma';
import prisma from './src/config/prisma.js';

try {
    console.log('Attempting to get User model...');
    const userModel = getModelByName('User');
    if (userModel) {
        console.log('SUCCESS: User model found by AdminJS.');
    } else {
        console.error('FAILURE: User model NOT found by AdminJS.');
    }
} catch (error) {
    console.error('ERROR:', error);
}
