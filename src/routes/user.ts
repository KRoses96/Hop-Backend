import express from "express";
import userController from "../controllers/userController";
export const userRouter = express.Router();
import multer from "multer";
// Multer for images
export const upload = multer({ storage: multer.memoryStorage() });

// Basic
userRouter.get("/", userController.getOneUser);
userRouter.put("/", upload.single("profilePicture"), userController.putUser);

// Friend
// userRouter.post("/friend/:username", userController.postFriendController);
userRouter.post("/friend/request/:username", userController.postFriendRequest);
userRouter.get("/friend/request", userController.getAllFriendRequests);
userRouter.post(
	"/friend/addRequest/:friendRequestId",
	userController.acceptFriendRequest,
);
userRouter.delete(
	"/friend/request/:friendRequestId",
	userController.rejectFriendRequest,
);

userRouter.delete("/friend/:friendId", userController.deleteFriendController);
userRouter.get("/friend", userController.getAllFriends);

export default userRouter;
