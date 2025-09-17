import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Feedback {
  id: number;
  username: string;
  profilePic: string | null;
  packageName: string;
  bookingDate: string;
  bookingTime: string;
  feedback: string;
  rating: number;
}

interface FeedbackSectionProps {
  feedbacks: Feedback[];
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedbacks }) => {
  return (
    <div className="flex flex-col gap-6">
      {feedbacks.map((fb) => (
        <motion.div
          key={fb.id}
          className="bg-white rounded-xl shadow-md p-4 flex gap-4"
          whileHover={{ scale: 1.01 }}
        >
          <img
            src={fb.profilePic || "/default.png"} // Use fallback if profilePic is null or empty
            alt={fb.username}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">{fb.username}</h4>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < fb.rating ? "#f59e0b" : "none"}
                    stroke="#f59e0b"
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {fb.packageName} — {fb.bookingDate} ({fb.bookingTime})
            </p>
            <p className="mt-2 text-gray-700 text-sm">{fb.feedback}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FeedbackSection;