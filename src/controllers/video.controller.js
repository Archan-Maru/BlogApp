import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    throw new ApiError(400, "Video title is required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is missing");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is missing");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video || !thumbnail) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const videoPublicId = video.public_id;
  const thumbnailPublicId = thumbnail.public_id;

  const newvideo = await Video.create({
    videoFile: video.secure_url || video.url,
    thumbnail: thumbnail.secure_url || thumbnail.url,
    title,
    description,
    duration: video.duration,
    owner: req.user._id,
    videoPublicId,
    thumbnailPublicId
  });

  return res.status(201).json(
    new ApiResponse(201, newvideo, "Video uploaded successfully")
  );
});


const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId)
    .populate("owner", "username avatar");

  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  const responseData = {
    _id: video._id,
    title: video.title,
    description: video.description,
    duration: video.duration,
    videoUrl: video.videoFile,        
    thumbnailUrl: video.thumbnail,
    views: video.views,
    owner: video.owner,
    createdAt: video.createdAt
  };

  return res.status(200).json(
    new ApiResponse(200, responseData, "Video fetched successfully")
  );
});


const updateVideo = asyncHandler(async (req, res) => {
  console.log("DEBUG: updateVideo invoked");
  try {
    const { videoId } = req.params;
    const { title, description } = req.body || {};

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to update this video");
    }

    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    if (req.files?.thumbnail?.[0]?.path) {
      const uploadedThumbnail = await uploadOnCloudinary(
        req.files.thumbnail[0].path
      );

      if (video.thumbnailPublicId) {
        
          await deleteFromCloudinary(video.thumbnailPublicId);
       
      }

      updateFields.thumbnail = uploadedThumbnail.secure_url || uploadedThumbnail.url;
      updateFields.thumbnailPublicId = uploadedThumbnail.public_id;
    }



    if (Object.keys(updateFields).length === 0) {
      throw new ApiError(400, "At least one field is required to update");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $set: updateFields },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(200, {
        _id: updatedVideo._id,
        title: updatedVideo.title,
        description: updatedVideo.description,
        thumbnail: updatedVideo.thumbnail,
        duration: updatedVideo.duration,
        updatedAt: updatedVideo.updatedAt
      }, "Video updated successfully")
    );
  } catch (err) {
    console.error("DEBUG: error in updateVideo:", err && err.stack ? err.stack : err);
    throw err;
  }
});



const deleteVideo = asyncHandler(async (req, res) => {
  console.log("DEBUG: deleteVideo invoked");
  try {
    const { videoId } = req.params
    const video=await Video.findById(videoId);

    if(!video)
    {
      throw new ApiError(404,"video not found");
    }

    if(video.owner.toString()!==req.user._id.toString())
    {
      throw new ApiError(403,"You are not allowed to delete this video")
    }

      await deleteFromCloudinary(video.videoPublicId, "video");
    

      await deleteFromCloudinary(video.thumbnailPublicId);
   


    const result = await Video.deleteOne({ _id: videoId });
  if (result.deletedCount !== 1) {
    throw new ApiError(500, "Database deletion failed");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Video deleted successfully")
  );
  } catch (err) {
    console.error("DEBUG: error in deleteVideo:", err && err.stack ? err.stack : err);
    throw err;
  }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(
    new ApiResponse(200, {
      _id: video._id,
      isPublished: video.isPublished
    }, "Publish status updated successfully")
  );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}