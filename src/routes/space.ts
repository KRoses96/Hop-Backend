import express from "express";
import spaceController from "../controllers/spaceController";

export const spaceRouter = express.Router();

// Basic
spaceRouter.post("/", spaceController.postSpace);
spaceRouter.delete("/:spaceId", spaceController.deleteSpace);
spaceRouter.put("/edit", spaceController.putSpace);

// Requests
spaceRouter.post("/request", spaceController.postSpaceRequest);
spaceRouter.post("/request/:requestId", spaceController.postAcceptSpaceRequest);
spaceRouter.delete("/request/:requestId", spaceController.deleteSpaceRequest);
spaceRouter.get("/request", spaceController.getAllSpaceRequests);

spaceRouter.delete(
	"/kick/:spaceId/:userId",
	spaceController.deleteUserFromSpace,
);

// SpacesAllowed
spaceRouter.get("/mySpaces", spaceController.getAdminSpaces);
spaceRouter.get("/invitedSpaces", spaceController.getInvitedSpaces);
spaceRouter.get("/spaceMembers/:spaceId", spaceController.getSpaceMembers);
spaceRouter.get("/ownSpaceRole/:spaceId", spaceController.getSpaceRole);
spaceRouter.put("/changeRole", spaceController.putUserRole);

export default spaceRouter;
