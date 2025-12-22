import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username profile")
    .sort({ createdAt: -1 })          
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return res.status(200).json(
    new ApiResponse(200, comments, "Comments fetched successfully")
  );
});


const addComment = asyncHandler(async (req, res) => {
    const {videoId}=req.params
  
    const user=req.user._id

    const {content}=req.body

    if(!content)
    {
        throw new ApiError(400,"Comment can not be empty")
    }

    const comment=await Comment.create({
        content,
        video:videoId,
        owner:user
    })

    return res.status(200).json(
        new ApiResponse(200,{ content: comment },"Comment posted successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to update this comment");
  }

  comment.content = content;
  await comment.save();

  return res.status(200).json(
    new ApiResponse(200, { content: comment }, "Comment updated successfully")
  );
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this comment");
  }

  await comment.deleteOne()

  return res.status(200).json(new ApiResponse(200,{},"comment deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }