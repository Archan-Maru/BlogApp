import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const user=req.user._id

    const existingState=await Subscription.findOne({
        channel:channelId,
        subscriber:user
    })

    if(existingState)
    {
        await existingState.deleteOne()
        return res.status(200).json(new ApiResponse(200,{subscribed:false},"Unsubscribed successfully"))
    }

    await Subscription.create({
        channel:channelId,
        subscriber:user
    })

    return res.status(200).json(new ApiResponse(200,{subscribed:true},"Subscribed successfully"))


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    
    const subscribers=await Subscription.find({
        channel:channelId
    }).populate("subscriber", "username email fullName avatar")

    return res.status(200).json(new ApiResponse(200,subscribers,"Subscribers fetched successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const subscribedChannels=await Subscription.find({
    subscriber:subscriberId
    }).populate("channel", "username email fullName avatar")

    return res.status(200).json(new ApiResponse(200,subscribedChannels,"Subscribed Channel fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}