import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const user=req.user._id

    const {content}=req.body

    const tweet=await Tweet.create({
        content,
        owner:user
    })

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId}=req.params

    const tweets=await Tweet.find({
        owner:userId
    })

        return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"))


})

const updateTweet = asyncHandler(async (req, res) => {
    const user=req.user._id

    const {content}=req.body

    const {tweetId}=req.params

    const tweet=await Tweet.findById(tweetId)

    if(tweet.owner.toString()!==user.toString())
    {
        return res.status(401).json(new ApiError(401,{},"Your are not allowed to update this tweet"))
    }

    tweet.content=content

    await tweet.save()

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
     const user=req.user._id


    const {tweetId}=req.params

    const tweet=await Tweet.findById(tweetId)

    if(tweet.owner.toString()!==user.toString())
    {
        return res.status(401).json(new ApiError(401,{},"Your are not allowed to delete this tweet"))
    }

   
    await tweet.deleteOne()

    return res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}