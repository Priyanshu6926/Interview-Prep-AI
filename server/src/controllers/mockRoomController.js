import MockRoom from "../models/MockRoom.js";
import generateRoomCode from "../utils/generateRoomCode.js";
import { generateMockRoomPrompts } from "../services/geminiService.js";

export async function createMockRoom(req, res, next) {
  try {
    const { topic, roleFocus, experience } = req.body;

    const roomCode = generateRoomCode();
    const prompts = await generateMockRoomPrompts({
      role: roleFocus,
      experience: Number(experience) || 0,
      topic
    });

    const room = await MockRoom.create({
      roomCode,
      topic,
      roleFocus,
      experience,
      host: {
        user: req.user._id,
        name: req.user.name,
        role: "host"
      },
      prompts,
      events: [
        {
          kind: "note",
          fromRole: "system",
          content: "Room created. Share the code with a peer to begin the mock interview."
        }
      ]
    });

    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
}

export async function joinMockRoom(req, res, next) {
  try {
    const room = await MockRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });

    if (!room) {
      res.status(404);
      throw new Error("Mock room not found.");
    }

    if (room.status === "ended") {
      res.status(400);
      throw new Error("This mock room has already ended.");
    }

    const isHost = String(room.host?.user) === String(req.user._id);
    const isExistingGuest = room.guest && String(room.guest?.user) === String(req.user._id);

    if (!isHost && !isExistingGuest) {
      if (room.guest) {
        res.status(403);
        throw new Error("This mock room is already full with 2 participants.");
      }

      room.guest = {
        user: req.user._id,
        name: req.user.name,
        role: "guest"
      };
      room.status = "active";
      room.events.push({
        kind: "note",
        fromRole: "system",
        content: `${req.user.name} joined the room as peer.`
      });
      await room.save();
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
}

export async function getMockRoom(req, res, next) {
  try {
    const room = await MockRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });

    if (!room) {
      res.status(404);
      throw new Error("Mock room not found.");
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
}

export async function saveRoomSignal(req, res, next) {
  try {
    const room = await MockRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });

    if (!room) {
      res.status(404);
      throw new Error("Mock room not found.");
    }

    room.signals.push({
      type: req.body.type,
      sdp: req.body.sdp,
      fromRole: req.body.fromRole
    });
    await room.save();

    res.json({ room });
  } catch (error) {
    next(error);
  }
}

export async function saveIceCandidate(req, res, next) {
  try {
    const room = await MockRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });

    if (!room) {
      res.status(404);
      throw new Error("Mock room not found.");
    }

    room.iceCandidates.push({
      candidate: req.body.candidate,
      sdpMid: req.body.sdpMid ?? null,
      sdpMLineIndex: req.body.sdpMLineIndex ?? null,
      fromRole: req.body.fromRole
    });
    await room.save();

    res.json({ room });
  } catch (error) {
    next(error);
  }
}

export async function addRoomEvent(req, res, next) {
  try {
    const room = await MockRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });

    if (!room) {
      res.status(404);
      throw new Error("Mock room not found.");
    }

    room.events.push({
      kind: req.body.kind || "note",
      fromRole: req.body.fromRole || "system",
      content: req.body.content
    });

    if (typeof req.body.activePromptIndex === "number") {
      room.activePromptIndex = req.body.activePromptIndex;
    }

    await room.save();
    res.json({ room });
  } catch (error) {
    next(error);
  }
}
