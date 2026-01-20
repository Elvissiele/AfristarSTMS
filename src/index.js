import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';
import session from 'express-session';

import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import prisma from './config/prisma.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { config } from './config/env.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Calculate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = config.port;

import { UserResource } from './resources/userResource.js';

// ... (imports)

const start = async () => {
    const app = express();

    // 1. Register AdminJS Adapter
    AdminJS.registerAdapter({ Database, Resource });

    // 2. Configure AdminJS
    const adminOptions = {
        resources: [
            {
                resource: { model: getModelByName('User'), client: prisma },
                options: UserResource.options
            },
            { resource: { model: getModelByName('Ticket'), client: prisma }, options: { navigation: 'Helpdesk' } },
            { resource: { model: getModelByName('Comment'), client: prisma }, options: { navigation: 'Helpdesk' } },
            {
                resource: { model: getModelByName('WebsiteContent'), client: prisma },
                options: {
                    navigation: 'CMS',
                    listProperties: ['key', 'value', 'description', 'updatedAt'],
                    editProperties: ['key', 'value', 'imageUrl', 'description']
                }
            },
        ],
        rootPath: '/admin',
        assets: {
            styles: ['/admin-overrides.css'],
        },
        branding: {
            companyName: 'Afristar Admin',
            logo: '/images/logo.jpg',
            favicon: '/images/logo.jpg',
            softwareBrothers: false,
            withMadeWithLove: false,
        },
        locale: {
            language: 'en',
            availableLanguages: ['en'],
            translations: {
                en: {
                    components: {
                        Login: {
                            welcomeHeader: 'Afristar Admin',
                            welcomeMessage: 'Managed by Spyder ICT Systems',
                            loginButton: 'Login',
                            properties: {
                                email: 'Email',
                                password: 'Password',
                            }
                        }
                    },
                    messages: {
                        loginWelcome: 'Welcome Afristar Admins', // Fallback for some versions
                    }
                }
            }
        }
    };

    const admin = new AdminJS(adminOptions);

    // 3. Build Authenticated Router
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
        authenticate: async (email, password) => {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user && user.role === 'ADMIN') {
                if (await bcrypt.compare(password, user.password)) {
                    return user;
                }
            }
            return false;
        },
        cookiePassword: 'super-secret-cookie-password-change-in-prod',
        cookieName: 'adminjs',
    }, null, {
        resave: false,
        saveUninitialized: true,
        secret: 'session-secret-key',
    });

    // 4. Security Headers (Adjusted for AdminJS)
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.tailwindcss.com"], // AdminJS needs unsafe-eval/inline
                styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.tailwindcss.com"],
                imgSrc: ["'self'", "data:", "images.unsplash.com", "gravatar.com"],
                fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
                frameSrc: ["'self'", "www.youtube.com", "maps.google.com"],
                upgradeInsecureRequests: [],
            },
        },
    }));

    // 5. Mount Admin Router (BEFORE Body Parsers)
    app.use(admin.options.rootPath, adminRouter);

    // 6. Standard Middleware
    app.use(compression());
    // Rate limiter skipped for AdminJS by mounting standard middleware after or selectively
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    });
    app.use('/api', limiter);
    app.use(hpp());
    app.use(cors());
    app.use(express.json());

    // 7. API Routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/tickets', ticketRoutes);
    app.use('/api/v1/admin', adminRoutes);
    app.use('/api/v1/content', contentRoutes);

    // 8. Static Files
    app.use(express.static(join(__dirname, '../public'), {
        maxAge: '1d',
        etag: false
    }));

    // Start Server
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Admin Interface available at http://localhost:${PORT}/admin`);
    });
};

start().catch(error => {
    console.error('Failed to start server:', error.message);
    console.error(error.stack);
});
