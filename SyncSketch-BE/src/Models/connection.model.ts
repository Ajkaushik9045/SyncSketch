import { model, Schema, type Types, type Document } from "mongoose";

export interface IConnection extends Document {
    from: Types.ObjectId;
    to: Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export const FriendRequest = model<IConnection>('Connection', ConnectionSchema);