const UserModel = require('../models/User');
const { hashPassword } = require('../services/auth.service');
const { generateAccessToken, generateRefreshToken } = require('../services/jwt.service');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, role, firstName, lastName, phone, location } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const user = await UserModel.create({
        email,
        password,
        role: role || 'candidate',
        firstName,
        lastName,
        phone,
        location,
      });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const { comparePassword } = require('../services/auth.service');
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const accessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
  }

  static async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          location: user.location,
          isActive: user.is_active,
          emailVerified: user.email_verified,
        },
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
