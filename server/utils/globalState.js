// exports.gameDetails = {};
// {
//   roomId: {
//     levelInformation:
//     [
//       {
//         drawingItem: "",
//         userInformation: {
//             "userId": score,
//         }
//       }
//     ]
//   }
// }

// exports.roomDetails = {};
// {
//   roomId: {
//     users: [ { userId: Boolean() }]
//     owner: userId
//   }
// }

// exports.socketDetails = {};
// {
//   userId: socketId
// }

class Details {

  constructor() {
    if (Details.instance == null) {
      this.gameDetails = {};
      this.roomDetails = {};
      this.socketDetails = {};

      Details.instance = this;
    }

    return Details.instance
  }

  isRoomPresent(roomId) {
    return roomId in this.roomDetails;
  }

  getRoomDetailsById(roomId) {
    return this.roomDetails[roomId];
  }

  setRoomDetailsById(roomId, data) {
    this.roomDetails[roomId] = data;
  }

  getAllRoomDetails() {
    return this.roomDetails;
  }

  getGameDetailsById(roomId) {
    return this.gameDetails[roomId];
  }

  setGameDetailsById(roomId, data) {
    this.gameDetails[roomId] = data;
  }

  getAllGameDetails() {
    return this.gameDetails;
  }

  getSocketIdByUserId(userId) {
    return this.socketDetails[userId];
  }

  setSocketIdByUserId(userId, socketId) {
    return this.socketDetails[userId] = socketId;
  }

}

var detailsObject = new Details();
Object.freeze(detailsObject);

export default detailsObject;