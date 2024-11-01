import notificationModel from "../models/notification.model.js";

export const getNotificationsController = async (req, res) => {

    try {
        const userId = req.user._id;

        const notifications = await notificationModel.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg"
        })

        await notificationModel.updateMany({ to: userId }, { read: true })

        res.status(200).json(notifications)

    } catch (error) {

        console.log(`Error in Get Notifications Controller: `, error);
        res.status(500).json({ message: "Internal server error" });

    }

}



export const deleteNotificationsController = async (req, res) => {
    try {
        const userId = req.user._id;

        await notificationModel.deleteMany({ to: userId })

        res.status(200).json({ message: "Notifications deleted successfully" })
    } catch (error) {

        console.log(`Error in Delete Notifications Controller: `, error);
        res.status(500).json({ message: "Internal server error" });

    }
}

export const deleteOneNotificationsController = async (req, res) => {

    const {id} = req.params
    try {
        const notification = await notificationModel.findById(id);

        if(notification){
            await notificationModel.findByIdAndDelete(id)
            res.status(200).json({ message: "Notification deleted successfully" })
        } else {
            res.status(404).json({ message: "Notification not found" })
        }
        
    } catch (error) {

        console.log(`Error in Delete One Notifications Controller: `, error);
        res.status(500).json({ message: "Internal server error" });

    }
}