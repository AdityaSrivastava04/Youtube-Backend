import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema= new Schema(
    {
        videoFiles:{
            type: String,  //clouding url
            require:true
        },
        thumbnail:{
            type: String,
            require:true
        },
        title:{
            type: String,
            require:true
        },
        discription:{
            type: String,
            require:true
        },
        duration:{
            type: Number,
            require:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectID,
            ref:"User"
        },
        public_id:{
            type: String,  //cloud video public is
            require:true
        }
    },
    {
        timestamps:true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)