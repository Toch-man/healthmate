import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import prisma from "../src/db.ts";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!, // ← add ! to fix undefined error
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile, // ← use Profile type from package
      done: VerifyCallback, // ← use VerifyCallback type from package
    ) => {
      try {
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { google_id: profile.id },
              { email: profile.emails![0].value }, // ← add ! here
            ],
          },
        });

        if (!user) {
          user = await prisma.user.create({
            // ← remove const here
            data: {
              email: profile.emails![0].value,
              google_id: profile.id,
              password: null,
              role: null,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error); // ← fix done parameters order
      }
    },
  ),
);
export default passport;
