const globalState = require('../utils/globalState');
const User = require('../models/User');
const { PLAYING } = require('../utils/constants');

const getUserDetailsForGame = (listOfUserIds) => {
  const userDetailsObj = {};

  for (let i = 0; i < listOfUserIds.length; i++)
    userDetailsObj[listOfUserIds[i]] = { status: PLAYING, totalScore: 0, level: 0 };

  return userDetailsObj;
}

exports.validGameRoomController = (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.userDetails;

  if (!globalState.isRoomPresent(roomId))
    return res.status(404).send({ message: 'There is no such room created!!' });

  if (!(globalState.getRoomDetailsById(roomId)['users'].includes(userId)) && !(globalState.getRoomDetailsById(roomId)['owner'] === userId))
    return res.status(401).send({ message: 'You are not authorised to play the game!!' });

  if (!globalState.isGameRoomPresent(roomId)) {
    const listOfUserIds = [...globalState.getRoomDetailsById(roomId)['users'], globalState.getRoomDetailsById(roomId)['owner']];

    globalState.setGameDetailsById(roomId, {
      roomId: {
        levels: [],
        drawings: [],
        users: getUserDetailsForGame(listOfUserIds)
      }
    })
  }

  return res.status(200).send({ scores: globalState.getGameDetailsById(roomId)['users'], level: getUserGameLevel(userId, roomId) });
}

const getUserGameLevel = (userId, roomId) => {
  const userGameDetails = globalState.getGameDetailsById(roomId)['users'];

  for (let id in userGameDetails) {
    if (id === userId) {
      return userGameDetails[userId]['level'];
    }
  }
}

exports.validCreatingRoomController = (req, res, next) => {
  const { userId } = req.userDetails;

  if (globalState.isUserPresent(userId))
    return res.status(403).send({ message: 'You are already present in other room or game' });

  next();
}

exports.validCreatedRoomController = (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.userDetails;

  if (!globalState.isRoomPresent(roomId))
    return res.status(404).send({ message: 'Page not found' });

  if (!(globalState.getRoomDetailsById(roomId)['owner'] === userId))
    return res.status(403).send({ message: 'You are not authorized' });

  return res.status(200).send(true);
}

exports.validJoiningRoomController = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.userDetails;
  console.log(globalState.getUserDetailsById(userId));

  if (roomId) {
    if (globalState.isUserPresent(userId))
      return res.status(403).send({ message: 'You are already in one of the game rooms' });

    if (!globalState.isRoomPresent(roomId))
      return res.status(404).send({ message: 'Page not found' });

    const { username } = await User.findById(userId, { username: 1 });
    globalState.setUserDetailsById(userId, { username, socketId: null, roomId });

    return res.status(200).send(true);
  } else {
    if (globalState.isUserPresent(userId))
      return res.status(403).send({ message: 'You are already in one of the game rooms' });

    return res.status(200).send(true);
  }

}

exports.validJoinedRoomController = (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.userDetails;

  if (!globalState.isRoomPresent(roomId))
    return res.status(404).send({ message: 'Page not found' });

  if (globalState.getUserDetailsById(userId)['roomId'] !== roomId)
    return res.status(403).send({ message: 'You are not authorised to play the game' });

  return res.status(200).send({ owner: globalState.getUserDetailsById(globalState.getRoomDetailsById(roomId)['owner'])['username'] });
}