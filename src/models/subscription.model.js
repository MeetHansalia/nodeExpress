import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
        required: true,
    },
    channel: {
        type: Schema.Types.ObjectId, // the channel that the user is subscribing to
        ref: "User",
        required: true,
    },
    // plan: {
    //     type: Schema.Types.ObjectId, // the plan that the user is subscribing to
    //     ref: "Plan",
    //     required: true,
    // },
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);