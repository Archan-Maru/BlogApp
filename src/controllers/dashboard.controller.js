import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const videos = await Video.find({ owner: userId });
  const totalSubscribers = await Subscription.countDocuments({ channel: userId });

  const totalVideos = videos.length;

  const totalViews = videos.reduce(
    (sum, video) => sum + video.views,
    0
  );

  return res.status(200).json(
    new ApiResponse(200, {
      totalVideos,
      totalSubscribers,
      totalViews
    }, "Channel stats fetched successfully")
  );
});


const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const videos = await Video.find({ owner: userId })
    .select("-videoPublicId -thumbnailPublicId")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, videos, "Channel videos fetched successfully")
  );
});


export {
    getChannelStats, 
    getChannelVideos
    }