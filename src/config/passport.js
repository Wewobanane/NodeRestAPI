const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const userRepository = require('../repositories/userRepository');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await userRepository.findByProvider('google', profile.id);

      if (!user) {
        const email = profile.emails[0].value;
        const existingUser = await userRepository.findByEmail(email);

        if (existingUser) {
          return done(null, false, { message: 'Email already registered with different provider' });
        }

        user = await userRepository.create({
          name: profile.displayName,
          email: email,
          provider: 'google',
          provider_id: profile.id,
          profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          is_email_verified: true
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub OAuth - Profile received:', JSON.stringify(profile, null, 2));
      
      let user = await userRepository.findByProvider('github', profile.id);

      if (!user) {
        // Check if emails are available
        if (!profile.emails || profile.emails.length === 0) {
          console.error('GitHub OAuth Error: No email provided. User may have private email settings.');
          return done(null, false, { 
            message: 'GitHub account must have a public email address. Update your GitHub email privacy settings and try again.' 
          });
        }

        const email = profile.emails[0].value;
        
        if (!email) {
          console.error('GitHub OAuth Error: Email value is null/undefined');
          return done(null, false, { 
            message: 'Unable to retrieve email from GitHub account' 
          });
        }

        console.log('GitHub OAuth - Checking email:', email);
        const existingUser = await userRepository.findByEmail(email);

        if (existingUser) {
          console.log('GitHub OAuth - Email already registered:', email);
          return done(null, false, { message: 'Email already registered with different provider' });
        }

        user = await userRepository.create({
          name: profile.displayName || profile.username,
          email: email,
          provider: 'github',
          provider_id: profile.id,
          profile_picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          is_email_verified: true
        });
        
        console.log('GitHub OAuth - New user created:', user.id);
      } else {
        console.log('GitHub OAuth - Existing user found:', user.id);
      }

      return done(null, user);
    } catch (error) {
      console.error('GitHub OAuth Error:', error.message, error.stack);
      return done(error, null);
    }
  }
));

module.exports = passport;
