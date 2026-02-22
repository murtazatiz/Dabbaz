import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './prisma';
import { generateReferralCode } from '../utils/otp';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('No email found'));
                }

                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            avatar_url: profile.photos?.[0].value,
                            role: 'CUSTOMER',
                            referral_code: generateReferralCode(),
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: payload.id },
                });

                if (!user) {
                    return done(null, false);
                }

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;
