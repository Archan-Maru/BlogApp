import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const user=req.user._id;

    const exisitingLike=await Like.findOne({
        video:videoId,
        likedBy:user
    })

    if(exisitingLike)
    {
        await exisitingLike.deleteOne();
        return res
        .status(200)
        .json(new ApiResponse(200,{liked:false},"video unliked"))
    }

    await Like.create({
        video:videoId,
        likedBy:user
    })

    return res
        .status(200)
        .json(new ApiResponse(200,{liked:true},"video liked"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const user=req.user._id;

    const exisitingLike=await Like.findOne({
        comment:commentId,
        likedBy:user
    })

    if(exisitingLike)
    {
        await exisitingLike.deleteOne();
        return res
        .status(200)
        .json(new ApiResponse(200,{liked:false},"comment unliked"))
    }

    await Like.create({
        comment:commentId,
        likedBy:user
    })

    return res
        .status(200)
        .json(new ApiResponse(200,{liked:true},"commentliked"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const user=req.user._id;

    const exisitingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:user
    })

    if(exisitingLike)
    {
        await exisitingLike.deleteOne();
        return res
        .status(200)
        .json(new ApiResponse(200,{liked:false},"tweet unliked"))
    }

    await Like.create({
        tweet:tweetId,
        likedBy:user
    })

    return res
        .status(200)
        .json(new ApiResponse(200,{liked:true},"tweet liked"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const user=req.user._id

    const likes=await Like.find({
        likedBy:user,
        video:{$ne:null}
    }).populate("video")

    const videos=likes.map(likes=>like.video)

    return res.status(200).josn(new ApiResponse(200,videos,"Liked videos fetched successfully"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}