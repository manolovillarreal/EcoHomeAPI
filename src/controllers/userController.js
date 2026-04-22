const userService = require('../services/userService');

const getMyStats = async (req, res, next) => {
  try {
    const stats = await userService.getCurrentUserStats(req.user.id);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyStats
};
