const User = require('../models/User');
const Game = require('../models/Game');
const globalState = require('../utils/globalState');

exports.createRoomController = (req, res) => {
  const { userId, email } = req.userDetails;

  let roomId;

  for (let i = 1000; i < 10000; i++) {
    if (!globalState.isRoomPresent(i)) {
      roomId = i;
      break;
    }
  }

  const username = email.split('@')[0];

  globalState.setSocketIdByUserId(userId, { username, socketId: null });
  globalState.setRoomDetailsById(roomId, { users: [], owner: userId });

  return res.status(200).send({ roomId });
}

exports.exitGameController = (req, res) => {
  const { gameFinished, deleteRoom } = req.query;
  const { roomId } = req.params;

  console.log(req.params, req.query);

  if (deleteRoom) {
    const roomDetails = globalState.getRoomDetailsById(roomId);

    // Delete socket owner and the delete all members in the room present
    const ownerId = roomDetails['owner'];
    globalState.deleteSocketByUserId(ownerId);

    for (let userId in roomDetails['users']) {
      globalState.deleteSocketByUserId(userId);
    }

    globalState.deleteRoomById(roomId);

    return res.status(200).send({ message: 'Saved to DB!!' });
  } if (gameFinished) {
    // First save details by room ID
    saveGameDetailsToDB(roomId);

    const roomDetails = globalState.getRoomDetailsById(roomId);

    // Delete socket owner and the delete all members in the room present
    const ownerId = roomDetails['owner'];
    globalState.deleteSocketByUserId(ownerId);

    for (let userId in roomDetails['users']) {
      globalState.deleteSocketByUserId(userId);
    }

    globalState.deleteRoomById(roomId);
    globalState.deleteGameById(roomId);

    return res.status(200).send({ message: 'Saved to DB!!' });
  }
}

// Write logic before saving to DB
const saveGameDetailsToDB = (roomId) => {

}

exports.gameHistoryController = async (req, res) => {
  const { userId } = req.userDetails;
  const user = await User.findById(userId);

  const { page, limit } = req.query;
  const ids = [];
  let length = page + limit < user.gameIds.length ? page + limit : user.gameIds.length;
  for (let i = page; i < length; i++)
    ids.push(user.gameIds[i]);

  try {

    console.log(ids);
    const gameDetails = await Game.find({
      _id: {
        $in: ids
      }
    });

    return res.status(200).send(gameDetails);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: 'Some error occured' });
  }
}

exports.gameDetailsController = async (req, res) => {
  const { userId } = req.userDetails;
  const { gameId } = req.params;

  const gamedetails = await Game.findById(gameId);

  // Is the user authenticated
  for (let userInformation in gamedetails['userInformation']) {
    if (userId in userInformation) {
      return res.status(200).send(gamedetails);
    }
  }

  return res.status(401).send({ message: 'Not authorized' });
}