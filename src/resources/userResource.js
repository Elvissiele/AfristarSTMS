import bcrypt from 'bcryptjs';
import cryptoRandomString from 'crypto-random-string';
import { sendEmail } from '../services/emailService.js';

const beforeNew = async (request) => {
    // Generate secure random password
    const rawPassword = cryptoRandomString({ length: 12, type: 'url-safe' });

    // Store raw password in request payload to access it in 'after' hook (it's not saved to DB if not in model)
    // We attach it to a temporary property or use context if available. 
    // In AdminJS, payload is what gets saved. We can hash it here, but we need the raw one for the email.
    // So we'll hash it, but attach rawPassword to the response context to be used in 'after'.

    // AdminJS hooks don't easily share state between before/after except via modifying payload or record.
    // A trick is to modify the payload, but send email *here* (before hashing) or stash it?
    // Actually, 'before' hooks modify the request. 'after' hooks modify the response.
    // The safest way is to generate, send email, THEN hash.

    // Send Email
    const email = request.payload.email;
    const personalEmail = request.payload.personalEmail;

    if (email) {
        // Send email logic here
        const subject = 'Welcome to Support Ticket System - Account Created';
        const text = `Your account has been created.\n\nUsername/Email: ${email}\nPassword: ${rawPassword}\n\nPlease log in and change your password immediately.`;

        await sendEmail({
            to: email,
            subject,
            text,
        });

        if (personalEmail) {
            await sendEmail({
                to: personalEmail,
                subject,
                text,
            });
        }
    }

    // Hash for DB
    request.payload.password = await bcrypt.hash(rawPassword, 10);
    request.payload.isTemporaryPassword = true;

    return request;
};

const beforeEdit = async (request) => {
    if (request.payload.password) {
        request.payload.password = await bcrypt.hash(request.payload.password, 10);
    }
    return request;
};

export const UserResource = {
    options: {
        navigation: 'User Management',
        properties: {
            password: {
                isVisible: false,
            },
            passwordHash: { isVisible: false },
            isTemporaryPassword: { isVisible: false },
            personalEmail: { isVisible: { list: false, edit: true, show: true, filter: true } }
        },
        actions: {
            new: {
                before: beforeNew,
            },
            edit: {
                before: beforeEdit,
            },
        }
    },
};

