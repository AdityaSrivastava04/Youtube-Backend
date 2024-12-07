import mongoose,{ Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const likesSchema=new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    likedBY:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

likesSchema.plugin(mongooseAggregatePaginate)

export const Likes=mongoose.model("Likes",likesSchema)