const ProfileModel = require('../models/Profile');

class ProfileController {
  static async upsert(req, res) {
    try {
      const { headline, bio, skills, experience, education, portfolioUrl, linkedinUrl, githubUrl } = req.body;

      const profile = await ProfileModel.upsert({
        userId: req.user.userId,
        headline,
        bio,
        skills,
        experience,
        education,
        portfolioUrl,
        linkedinUrl,
        githubUrl,
      });

      res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
      console.error('Profile upsert error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getByUserId(req, res) {
    try {
      const profile = await ProfileModel.findByUserId(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json({ profile });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMyProfile(req, res) {
    try {
      const profile = await ProfileModel.findByUserId(req.user.userId);
      res.json({ profile });
    } catch (error) {
      console.error('Get my profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ProfileController;
